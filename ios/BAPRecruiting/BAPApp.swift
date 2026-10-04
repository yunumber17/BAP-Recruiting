//
//  BAPApp.swift
//  BAP Recruiting — Ballers Across Pacific
//
//  App entry point + top-level routing.
//

import SwiftUI

@main
struct BAPApp: App {
    @StateObject private var state = AppState()
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(state)
                .tint(BAP.blue)
                .task { await state.boot() }
        }
    }
}

struct RootView: View {
    @EnvironmentObject var state: AppState
    var body: some View {
        Group {
            switch state.route {
            case .loading:
                ZStack {
                    BAP.canvas.ignoresSafeArea()
                    ProgressView().tint(BAP.blue)
                }
            case .auth:
                AuthFlow()
            case .onboarding:
                OnboardingFlow()
            case .app:
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.2), value: state.route)
    }
}
