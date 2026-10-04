//
//  MainTabView.swift
//  BAP Recruiting
//
//  Bottom navigation: white, thin top border, outline icons, blue when active.
//

import SwiftUI
import UIKit

struct MainTabView: View {
    @EnvironmentObject var state: AppState
    @State private var tab = 0

    var body: some View {
        TabView(selection: $tab) {
            NavigationStack { HomeView() }
                .tabItem { Label("ホーム", systemImage: "house") }.tag(0)
            NavigationStack { ScoreView() }
                .tabItem { Label("進捗", systemImage: "chart.bar") }.tag(1)
            NavigationStack { CollegesView() }
                .tabItem { Label("大学", systemImage: "graduationcap") }.tag(2)
            NavigationStack { CoachView() }
                .tabItem { Label("コーチ", systemImage: "bubble.left.and.bubble.right") }.tag(3)
            NavigationStack { ProfileView() }
                .tabItem { Label("自分", systemImage: "person") }.tag(4)
        }
        .tint(BAP.blue)
        .onAppear {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = .white
            appearance.shadowColor = UIColor(BAP.border)
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}

// MARK: - Shared scroll container with a white sticky-feel header area

struct ScreenScroll<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        ScrollView {
            VStack(spacing: 0) { content }
                .padding(.bottom, 32)
        }
        .background(BAP.canvas)
        .scrollIndicators(.hidden)
    }
}

// MARK: - Section wrapper with an uppercase label

struct Section<Content: View>: View {
    let title: String
    var trailing: AnyView? = nil
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                SectionLabel(title)
                Spacer()
                if let trailing { trailing }
            }
            content
        }
        .padding(.horizontal, BAP.hPad)
        .padding(.top, 24)
    }
}
