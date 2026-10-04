//
//  DesignSystem.swift
//  BAP Recruiting — Ballers Across Pacific
//
//  A blend of the original BAP rough draft and a clean, bright, enterprise-grade
//  SaaS design language. Navy carries the brand identity; bright blue (#0A67C7)
//  drives actions, links, progress, and notifications. Pure-white surfaces,
//  generous whitespace, flat cards, thin dividers, pill buttons.
//

import SwiftUI
import UIKit

// MARK: - Color palette

enum BAP {

    // Brand
    static let navy      = Color(hex: 0x1B2D4E)   // identity, big headers, logo
    static let navyMid   = Color(hex: 0x2A4272)
    static let blue      = Color(hex: 0x0A67C7)   // actions, links, progress, active nav
    static let blueSoft  = Color(hex: 0xF2F8FF)   // selected tabs, fills, progress track
    static let blueText  = Color(hex: 0x185FA5)   // text on soft-blue fills

    // Surfaces
    static let white     = Color.white
    static let canvas    = Color.white            // ~90–95% of every screen
    static let searchBg  = Color(hex: 0xF6F7F8)
    static let inset     = Color(hex: 0xF7F8FA)

    // Text
    static let text      = Color(hex: 0x202124)
    static let text2     = Color(hex: 0x5F6368)
    static let text3     = Color(hex: 0x8A9099)
    static let placeholder = Color(hex: 0xB7BCC5)

    // Lines
    static let border    = Color(hex: 0xECECEC)
    static let borderMd  = Color(hex: 0xE0E1E4)

    // Status
    static let success   = Color(hex: 0x2E7D32)
    static let successBg = Color(hex: 0xEAF6EC)
    static let warning   = Color(hex: 0xB7791F)
    static let warningBg = Color(hex: 0xFEF7E6)
    static let danger    = Color(hex: 0xB91C1C)
    static let dangerBg  = Color(hex: 0xFCEBEB)
    static let purple    = Color(hex: 0x6D28D9)
    static let purpleBg  = Color(hex: 0xF3F0FF)

    // Layout
    static let cardRadius: CGFloat = 12
    static let inputRadius: CGFloat = 14
    static let pillRadius: CGFloat = 20
    static let hPad: CGFloat = 20
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red:   Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 8) & 0xff) / 255,
            blue:  Double(hex & 0xff) / 255,
            opacity: alpha
        )
    }
}

// MARK: - Typography

extension Font {
    static let bapLargeTitle = Font.system(size: 24, weight: .semibold)
    static let bapTitle      = Font.system(size: 22, weight: .semibold)
    static let bapNav        = Font.system(size: 18, weight: .semibold)
    static let bapSection    = Font.system(size: 16, weight: .semibold)
    static let bapCardTitle  = Font.system(size: 15, weight: .medium)
    static let bapBody       = Font.system(size: 14, weight: .regular)
    static let bapSecondary  = Font.system(size: 13, weight: .regular)
    static let bapMeta       = Font.system(size: 12, weight: .regular)
    static let bapBadge      = Font.system(size: 11, weight: .semibold)
}

// MARK: - Section label (uppercase tracking)

struct SectionLabel: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .semibold))
            .tracking(0.7)
            .textCase(.uppercase)
            .foregroundColor(BAP.text3)
    }
}

// MARK: - Card

struct Card<Content: View>: View {
    var padding: CGFloat = 16
    @ViewBuilder var content: Content
    var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .clipShape(RoundedRectangle(cornerRadius: BAP.cardRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: BAP.cardRadius, style: .continuous)
                    .stroke(BAP.border, lineWidth: 1)
            )
    }
}

// MARK: - Buttons

struct PrimaryButton: View {
    let title: String
    var fill: Color = BAP.blue
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(fill)
                .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
        }
        .buttonStyle(PressableStyle())
    }
}

struct SecondaryButton: View {
    let title: String
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(BAP.text)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(BAP.white)
                .overlay(
                    RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous)
                        .stroke(BAP.borderMd, lineWidth: 1.5)
                )
        }
        .buttonStyle(PressableStyle())
    }
}

/// Small pill button used inline (e.g. "+ コーチを追加").
struct PillButton: View {
    let title: String
    var filled = true
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(filled ? .white : BAP.blue)
                .padding(.horizontal, 16)
                .frame(height: 36)
                .background(filled ? BAP.blue : BAP.blueSoft)
                .clipShape(Capsule())
        }
        .buttonStyle(PressableStyle())
    }
}

struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.8 : 1)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

// MARK: - Badge

struct Badge: View {
    enum Kind { case navy, blue, green, amber, red, purple, gray }
    let text: String
    var kind: Kind = .gray

    private var colors: (Color, Color) {
        switch kind {
        case .navy:   return (Color(hex: 0xE8EDF5), BAP.navy)
        case .blue:   return (BAP.blueSoft, BAP.blueText)
        case .green:  return (BAP.successBg, BAP.success)
        case .amber:  return (BAP.warningBg, BAP.warning)
        case .red:    return (BAP.dangerBg, BAP.danger)
        case .purple: return (BAP.purpleBg, BAP.purple)
        case .gray:   return (Color(hex: 0xF2F2F4), BAP.text2)
        }
    }
    var body: some View {
        Text(text)
            .font(.bapBadge)
            .foregroundColor(colors.1)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(colors.0)
            .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
    }
}

// MARK: - Progress bar

struct ProgressBar: View {
    var value: Double          // 0...1
    var height: CGFloat = 6
    var tint: Color = BAP.blue
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(BAP.blueSoft)
                Capsule().fill(tint)
                    .frame(width: max(0, min(1, value)) * geo.size.width)
            }
        }
        .frame(height: height)
    }
}

// MARK: - Filter pill

struct FilterPill: View {
    let title: String
    let selected: Bool
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(selected ? .white : BAP.text2)
                .padding(.horizontal, 14)
                .frame(height: 34)
                .background(selected ? BAP.blue : BAP.white)
                .overlay(
                    Capsule().stroke(selected ? BAP.blue : BAP.border, lineWidth: 1.5)
                )
                .clipShape(Capsule())
        }
        .buttonStyle(PressableStyle())
    }
}

// MARK: - Search field

struct SearchField: View {
    let placeholder: String
    @Binding var text: String
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16, weight: .regular))
                .foregroundColor(BAP.text3)
            TextField(placeholder, text: $text)
                .font(.bapBody)
                .foregroundColor(BAP.text)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 14)
        .frame(height: 44)
        .background(BAP.searchBg)
        .clipShape(RoundedRectangle(cornerRadius: BAP.pillRadius, style: .continuous))
    }
}

// MARK: - Labeled text field

struct LabeledField: View {
    let label: String
    var placeholder: String = ""
    var keyboard: UIKeyboardType = .default
    @Binding var text: String
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(BAP.text2)
            TextField(placeholder, text: $text)
                .font(.bapBody)
                .foregroundColor(BAP.text)
                .keyboardType(keyboard)
                .padding(.horizontal, 14)
                .frame(height: 48)
                .background(BAP.white)
                .overlay(
                    RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous)
                        .stroke(BAP.border, lineWidth: 1.5)
                )
        }
    }
}

// MARK: - Empty state

struct EmptyStateCard: View {
    let message: String
    var body: some View {
        Card {
            Text(message)
                .font(.bapBody)
                .foregroundColor(BAP.text3)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
        }
    }
}

// MARK: - Screen header (title + optional trailing action)

struct ScreenHeader<Trailing: View>: View {
    let title: String
    var subtitle: String? = nil
    @ViewBuilder var trailing: Trailing

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline) {
                Text(title).font(.bapTitle).foregroundColor(BAP.text)
                Spacer()
                trailing
            }
            if let subtitle {
                Text(subtitle).font(.bapSecondary).foregroundColor(BAP.text3)
            }
        }
        .padding(.horizontal, BAP.hPad)
        .padding(.top, 8)
        .padding(.bottom, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BAP.white)
        .overlay(Divider().background(BAP.border), alignment: .bottom)
    }
}

extension ScreenHeader where Trailing == EmptyView {
    init(title: String, subtitle: String? = nil) {
        self.init(title: title, subtitle: subtitle) { EmptyView() }
    }
}

// MARK: - Avatar (initials on a soft tint, logo-style)

struct InitialsAvatar: View {
    let text: String
    var size: CGFloat = 46
    var tint: Color = BAP.blueSoft
    var fg: Color = BAP.blueText

    private var initials: String {
        let parts = text.split(separator: " ")
        let first = parts.first.map { String($0.prefix(2)) } ?? String(text.prefix(2))
        return first.uppercased()
    }
    var body: some View {
        Text(initials)
            .font(.system(size: size * 0.32, weight: .semibold))
            .foregroundColor(fg)
            .frame(width: size, height: size)
            .background(tint)
            .clipShape(Circle())
    }
}
