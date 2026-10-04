//
//  ContactDetailView.swift
//  BAP Recruiting
//
//  A coach contact: email thread, message logging, status controls, delete,
//  and a shortcut to the email builder.
//

import SwiftUI

struct ContactDetailView: View {
    @EnvironmentObject var state: AppState
    @Environment(\.dismiss) private var dismiss
    let contactID: String

    @State private var newMessage = ""
    @State private var outbound = true

    private var contact: CoachContact? { state.contacts.first { $0.id == contactID } }

    var body: some View {
        Group {
            if let c = contact { content(c) } else { Color.clear }
        }
        .navigationBarHidden(true)
    }

    private func content(_ c: CoachContact) -> some View {
        ScreenScroll {
            // Header
            VStack(alignment: .leading, spacing: 16) {
                BackChip(label: "コーチ連絡") { dismiss() }
                VStack(alignment: .leading, spacing: 6) {
                    Text(c.coachName ?? "").font(.bapNav).foregroundColor(BAP.text)
                    Text([c.coachRole, c.coachEmail].compactMap { $0 }.joined(separator: " · "))
                        .font(.bapSecondary).foregroundColor(BAP.text3)
                    Badge(text: c.statusEnum.label, kind: c.statusEnum.badge)
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 60).padding(.bottom, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BAP.white)
            .overlay(Divider().background(BAP.border), alignment: .bottom)

            // Thread
            Section(title: "メールスレッド") {
                let thread = state.messages(for: c.id)
                if thread.isEmpty {
                    EmptyStateCard(message: "まだメッセージはありません")
                } else {
                    VStack(spacing: 8) {
                        ForEach(thread) { m in MessageBubble(message: m, myName: state.player?.name ?? "自分") }
                    }
                }
            }

            // Log a message
            Section(title: "メッセージを記録") {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        FilterPill(title: "自分が送信", selected: outbound) { outbound = true }
                        FilterPill(title: "コーチから受信", selected: !outbound) { outbound = false }
                    }
                    TextEditor(text: $newMessage)
                        .font(.bapBody).frame(minHeight: 90).padding(8)
                        .scrollContentBackground(.hidden).background(BAP.white)
                        .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.border, lineWidth: 1.5))
                    PrimaryButton(title: "記録する") {
                        let body = newMessage; newMessage = ""
                        Task { await state.logMessage(contactID: c.id, body: body, outbound: outbound) }
                    }
                }
            }

            // Status
            Section(title: "ステータスを変更") {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(ContactStatus.allCases, id: \.self) { s in
                            FilterPill(title: s.label, selected: c.statusEnum == s) {
                                Task { await state.setContactStatus(c, s) }
                            }
                        }
                    }
                }
            }

            // Actions
            VStack(spacing: 10) {
                NavigationLink { EmailBuilderView(prefillCoach: c.coachName ?? "") } label: {
                    Text("英語メールを作成").font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                        .frame(maxWidth: .infinity).frame(height: 50).background(BAP.blue)
                        .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
                }
                SecondaryButton(title: "このコーチを削除") {
                    Task { await state.deleteContact(c); dismiss() }
                }
            }
            .padding(.horizontal, BAP.hPad).padding(.top, 24)
        }
    }
}

struct MessageBubble: View {
    let message: CoachMessage
    let myName: String
    var body: some View {
        VStack(alignment: message.isMine ? .trailing : .leading, spacing: 4) {
            Text("\(message.isMine ? myName : "コーチ") · \(DateUtil.relativeDays(message.sentAt))")
                .font(.system(size: 11)).foregroundColor(BAP.text3).padding(.horizontal, 4)
            Text(message.body ?? "")
                .font(.bapBody).foregroundColor(message.isMine ? .white : BAP.text).lineSpacing(4)
                .padding(.horizontal, 14).padding(.vertical, 12)
                .background(message.isMine ? BAP.blue : BAP.white)
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(message.isMine ? Color.clear : BAP.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .frame(maxWidth: 280, alignment: message.isMine ? .trailing : .leading)
        }
        .frame(maxWidth: .infinity, alignment: message.isMine ? .trailing : .leading)
    }
}
