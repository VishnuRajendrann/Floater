use tauri::Builder;
#[cfg(not(dev))]
use tauri::{ipc::CapabilityBuilder, Manager, Url};

/// Stable release origin so web `localStorage` persists across app restarts.
const DEFAULT_LOCALHOST_PORT: u16 = 17_352;

#[cfg(not(dev))]
/// IPC permissions for window management from the frontend. Must be granted on the
/// runtime localhost capability: release builds load `http://localhost:{port}`, which is a
/// remote origin, so `default.json` (local-only) does not authorize these calls.
const FLOATER_WINDOW_IPC_PERMISSIONS: &[&str] = &[
    "core:event:allow-listen",
    "core:event:allow-unlisten",
    "core:window:allow-inner-size",
    "core:window:allow-outer-position",
    "core:window:allow-scale-factor",
    "core:window:allow-set-position",
    "core:window:allow-set-size",
    "core:window:allow-set-always-on-top",
    "core:window:allow-is-always-on-top",
    "core:window:allow-set-decorations",
    "core:window:allow-show",
    "core:window:allow-center",
    "core:window:allow-unminimize",
    "core:window:allow-is-minimized",
    "core:window:allow-set-focus",
    "core:window:allow-available-monitors",
    "core:window:allow-outer-size",
    "core:window:allow-set-shadow",
    "core:window:allow-start-dragging",
];

#[cfg(not(dev))]
fn with_floater_window_permissions(builder: CapabilityBuilder) -> CapabilityBuilder {
    let mut builder = builder;
    for permission in FLOATER_WINDOW_IPC_PERMISSIONS {
        builder = builder.permission(*permission);
    }
    builder
}

fn resolve_localhost_port() -> u16 {
    if std::net::TcpListener::bind(("127.0.0.1", DEFAULT_LOCALHOST_PORT)).is_ok() {
        return DEFAULT_LOCALHOST_PORT;
    }
    let fallback = portpicker::pick_unused_port().expect("failed to find unused port");
    eprintln!(
        "Floater: port {DEFAULT_LOCALHOST_PORT} is in use; using {fallback}. Preferences and recent videos will not match the usual localhost origin."
    );
    fallback
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let port = resolve_localhost_port();

    Builder::default()
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .setup(move |_app| {
            #[cfg(not(dev))]
            {
                let url: Url = format!("http://localhost:{}", port)
                    .parse()
                    .expect("invalid localhost URL");

                _app.add_capability(with_floater_window_permissions(
                    CapabilityBuilder::new("localhost")
                        .remote(url.to_string())
                        .window("main"),
                ))?;

                if let Some(window) = _app.get_webview_window("main") {
                    window.navigate(url)?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
