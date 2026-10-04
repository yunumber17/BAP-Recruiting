//
//  AuthFlow.swift
//  BAP Recruiting
//
//  Welcome → Register / Login. Real Supabase auth via AppState.
//

import SwiftUI

struct AuthFlow: View {
    enum View_: Hashable { case welcome, login, register }
    @State private var view: View_ = .welcome

    var body: some View {
        ZStack {
            BAP.canvas.ignoresSafeArea()
            switch view {
            case .welcome:  WelcomeView(view: $view)
            case .login:    LoginView(view: $view)
            case .register: RegisterView(view: $view)
            }
        }
    }
}

private struct WelcomeView: View {
    @Binding var view: AuthFlow.View_
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer()
            Badge(text: "BETA", kind: .navy)
            Text("BALLERS\nACROSS\nPACIFIC")
                .font(.system(size: 34, weight: .bold))
                .foregroundColor(BAP.navy)
                .tracking(-0.5)
                .padding(.top, 12)
            Text("日本の野球選手のための\nアメリカ大学留学プラットフォーム")
                .font(.system(size: 15))
                .foregroundColor(BAP.text2)
                .lineSpacing(6)
                .padding(.top, 14)
            Spacer()
            VStack(spacing: 10) {
                PrimaryButton(title: "新規登録") { view = .register }
                SecondaryButton(title: "ログイン") { view = .login }
            }
        }
        .padding(.horizontal, 32)
        .padding(.vertical, 48)
    }
}

private struct RegisterView: View {
    @EnvironmentObject var state: AppState
    @Binding var view: AuthFlow.View_
    @State private var email = ""
    @State private var password = ""
    @State private var error: String?
    @State private var busy = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                BackChip(label: "戻る") { view = .welcome }
                VStack(alignment: .leading, spacing: 6) {
                    Text("アカウントを作成").font(.bapTitle).foregroundColor(BAP.text)
                    Text("メールアドレスとパスワードで登録してください")
                        .font(.bapSecondary).foregroundColor(BAP.text2)
                }
                .padding(.top, 8)

                LabeledField(label: "メールアドレス", placeholder: "example@gmail.com", keyboard: .emailAddress, text: $email)
                SecureLabeledField(label: "パスワード", placeholder: "6文字以上", text: $password)

                if let error { ErrorNote(error) }

                PrimaryButton(title: busy ? "処理中…" : "次へ") { submit() }
                    .padding(.top, 4)

                Divider().background(BAP.border).padding(.vertical, 8)
                SecondaryButton(title: "Googleで続ける") { Task { await state.loginWithGoogle() } }

                HStack {
                    Spacer()
                    Text("すでにアカウントをお持ちですか？").font(.bapSecondary).foregroundColor(BAP.text2)
                    Button("ログイン") { view = .login }
                        .font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                    Spacer()
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, BAP.hPad)
            .padding(.vertical, 32)
        }
    }

    private func submit() {
        error = nil; busy = true
        Task {
            let msg = await state.register(email: email, password: password)
            busy = false
            if let msg { error = msg }
        }
    }
}

private struct LoginView: View {
    @EnvironmentObject var state: AppState
    @Binding var view: AuthFlow.View_
    @State private var email = ""
    @State private var password = ""
    @State private var error: String?
    @State private var busy = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                BackChip(label: "戻る") { view = .welcome }
                VStack(alignment: .leading, spacing: 6) {
                    Text("ログイン").font(.bapTitle).foregroundColor(BAP.text)
                    Text("メールアドレスとパスワードを入力してください")
                        .font(.bapSecondary).foregroundColor(BAP.text2)
                }
                .padding(.top, 8)

                LabeledField(label: "メールアドレス", placeholder: "example@gmail.com", keyboard: .emailAddress, text: $email)
                SecureLabeledField(label: "パスワード", placeholder: "パスワード", text: $password)

                if let error { ErrorNote(error) }

                PrimaryButton(title: busy ? "処理中…" : "ログイン") { submit() }
                    .padding(.top, 4)

                HStack {
                    Spacer()
                    Text("アカウントがありませんか？").font(.bapSecondary).foregroundColor(BAP.text2)
                    Button("新規登録") { view = .register }
                        .font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                    Spacer()
                }
                .padding(.top, 4)
            }
            .padding(.horizontal, BAP.hPad)
            .padding(.vertical, 32)
        }
    }

    private func submit() {
        error = nil; busy = true
        Task {
            let msg = await state.login(email: email, password: password)
            busy = false
            if let msg { error = msg }
        }
    }
}

// MARK: - Small shared bits

struct SecureLabeledField: View {
    let label: String
    var placeholder: String = ""
    @Binding var text: String
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.system(size: 12, weight: .semibold)).foregroundColor(BAP.text2)
            SecureField(placeholder, text: $text)
                .font(.bapBody).foregroundColor(BAP.text)
                .padding(.horizontal, 14).frame(height: 48)
                .background(BAP.white)
                .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.border, lineWidth: 1.5))
        }
    }
}

struct BackChip: View {
    let label: String
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: "arrow.left").font(.system(size: 14, weight: .semibold))
                Text(label).font(.system(size: 14, weight: .medium))
            }
            .foregroundColor(BAP.blue)
        }
    }
}

struct ErrorNote: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text)
            .font(.bapSecondary).foregroundColor(BAP.danger)
            .padding(12).frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.dangerBg)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
