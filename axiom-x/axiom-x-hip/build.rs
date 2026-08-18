use std::env;
use std::path::{Path, PathBuf};
use std::process::Command;

fn main() {
    let target = env::var("TARGET").unwrap_or_default();
    let is_windows = target.contains("windows");

    let hip_root = find_hip_root();
    if hip_root.is_none() {
        println!("cargo:warning=HIP SDK not found — hip probe will be absent");
        println!("cargo:rustc-cfg=hip_probe=\"absent\"");
        return;
    }
    let hip_root = hip_root.unwrap();
    let hip_bin = hip_root.join("bin");

    let hipcc = if is_windows {
        hip_bin.join("hipcc.bat")
    } else {
        hip_bin.join("hipcc")
    };

    if !hipcc.exists() {
        println!("cargo:warning=hipcc not found — hip probe will be absent");
        println!("cargo:rustc-cfg=hip_probe=\"absent\"");
        return;
    }

    let src = Path::new("src").join("hip_probe.cpp");
    let out_dir_str = env::var("OUT_DIR").unwrap();
    let out_dir = Path::new(&out_dir_str);
    let ext = if is_windows { "obj" } else { "o" };
    let out_obj = out_dir.join(format!("hip_probe.{}", ext));

    let mut cmd = Command::new(&hipcc);
    cmd.args(&[
        "-std=c++17", "-O3", "-c",
        src.to_str().unwrap(),
        "-o", out_obj.to_str().unwrap(),
    ])
    .env("HIP_PATH", &hip_root)
    .env("ROCM_PATH", &hip_root);

    if is_windows {
        // Build CPATH with MSVC + Windows SDK includes
        let mut cpath = Vec::new();
        if let Some(inc) = find_msvc_include() { cpath.push(inc); }
        if let Some(inc) = find_windows_sdk_ucrt_include() { cpath.push(inc); }
        if !cpath.is_empty() {
            cmd.env("CPATH", cpath.join(";"));
        }
    }

    match cmd.status() {
        Ok(s) if s.success() => {
            // Tell rustc to link the compiled .obj and amdhip64
            println!("cargo:rustc-link-arg={}", out_obj.display());

            if is_windows {
                let hip_lib = hip_root.join("lib");
                if hip_lib.exists() {
                    println!("cargo:rustc-link-search=native={}", hip_lib.display());
                }
                println!("cargo:rustc-link-lib=amdhip64");
            } else {
                let hip_lib = hip_root.join("lib");
                if hip_lib.exists() {
                    println!("cargo:rustc-link-search=native={}", hip_lib.display());
                }
                println!("cargo:rustc-link-lib=amdhip64");
            }
            println!("cargo:rustc-cfg=hip_probe=\"present\"");
        }
        Ok(s) => {
            println!("cargo:warning=hipcc failed: exit code {:?}", s.code());
            println!("cargo:rustc-cfg=hip_probe=\"absent\"");
        }
        Err(e) => {
            println!("cargo:warning=hipcc error: {}", e);
            println!("cargo:rustc-cfg=hip_probe=\"absent\"");
        }
    }

    println!("cargo:rerun-if-changed=src/hip_probe.cpp");
    println!("cargo:rerun-if-env-changed=HIP_PATH");
    println!("cargo:rerun-if-env-changed=ROCM_PATH");
}

fn find_hip_root() -> Option<PathBuf> {
    for key in &["HIP_PATH", "ROCM_PATH"] {
        if let Ok(path) = env::var(*key) {
            let p = PathBuf::from(path.trim());
            if p.exists() { return Some(p); }
        }
    }
    let candidates = [
        r"C:\Program Files\AMD\ROCm\7.1",
        r"C:\Program Files\AMD\ROCm\7.0",
        r"C:\Program Files\AMD\ROCm\6.4",
        r"C:\Program Files\AMD\HIP",
        r"C:\Program Files\HIP SDK",
    ];
    for c in &candidates {
        if Path::new(c).exists() { return Some(PathBuf::from(c)); }
    }
    None
}

fn find_vswhere() -> Option<PathBuf> {
    let p = r"C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe";
    if Path::new(p).exists() { Some(PathBuf::from(p)) } else { None }
}

fn run_vswhere(args: &[&str]) -> Option<String> {
    let vswhere = find_vswhere()?;
    let out = Command::new(&vswhere).args(args).output().ok()?;
    if out.status.success() {
        String::from_utf8(out.stdout).ok().map(|s| s.trim().to_string())
    } else { None }
}

fn find_msvc_toolchain() -> Option<PathBuf> {
    let install_path = run_vswhere(&[
        "-latest", "-products", "*",
        "-requires", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
        "-property", "installationPath",
    ])?;
    let base = PathBuf::from(install_path).join("VC").join("Tools").join("MSVC");
    if !base.exists() { return None; }
    let mut versions: Vec<PathBuf> = std::fs::read_dir(&base).ok()?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .map(|e| e.path())
        .collect();
    versions.sort();
    versions.last().cloned()
}

fn find_msvc_include() -> Option<String> {
    let tc = find_msvc_toolchain()?;
    let inc = tc.join("include");
    if inc.exists() { Some(inc.to_str()?.to_string()) } else { None }
}

fn find_windows_sdk_ucrt_include() -> Option<String> {
    let base = Path::new(r"C:\Program Files (x86)\Windows Kits\10\Include");
    if !base.exists() { return None; }
    let mut versions: Vec<String> = std::fs::read_dir(base).ok()?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .filter_map(|e| e.file_name().to_str().map(|s| s.to_string()))
        .filter(|s| s.starts_with("10.0."))
        .collect();
    versions.sort();
    let ver = versions.last()?;
    let p = base.join(ver).join("ucrt");
    if p.exists() { Some(p.to_str()?.to_string()) } else { None }
}
