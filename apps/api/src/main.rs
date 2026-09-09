use api::app;
use std::net::SocketAddr;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter("info").init();

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    let listener = TcpListener::bind(addr)
        .await
        .expect("failed to bind NESGESFinance API listener");

    println!("🚀 Servidor NESGESFinance API escuchando en http://{}", addr);

    axum::serve(listener, app())
        .await
        .expect("NESGESFinance API server failed");
}
