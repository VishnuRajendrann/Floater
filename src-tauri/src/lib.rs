use tauri::{ipc::CapabilityBuilder, Manager, Url, WebviewUrl};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let port = portpicker::pick_unused_port().expect("failed to find unused port");

    tauri::Builder::default()
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .setup(move |app| {
            #[cfg(not(dev))]
            {
                let url: Url = format!("http://localhost:{}", port)
                    .parse()
                    .expect("invalid localhost URL");

                app.add_capability(
                    CapabilityBuilder::new("localhost")
                        .remote(url.to_string())
                        .window("main"),
                )?;

                if let Some(window) = app.get_webview_window("main") {
                    window.navigate(url)?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
