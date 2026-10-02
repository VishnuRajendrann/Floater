use tauri::Builder;
#[cfg(not(dev))]
use tauri::{ipc::CapabilityBuilder, Manager, Url};

/// Stable release origin so web `localStorage` persists across app restarts.
const DEFAULT_LOCALHOST_PORT: u16 = 17_352;

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

                _app.add_capability(
                    CapabilityBuilder::new("localhost")
                        .remote(url.to_string())
                        .window("main"),
                )?;

                if let Some(window) = _app.get_webview_window("main") {
                    window.navigate(url)?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
