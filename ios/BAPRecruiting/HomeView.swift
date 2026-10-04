//
//  HomeView.swift
//  BAP Recruiting
//
//  Dashboard: greeting, recruiting-readiness panel, quick stats, today's tasks,
//  next event. First-time users see a guided variant. All data is real.
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var state: AppState
    @State private var newTask = ""

    var body: some View {
        ScreenScroll {
            header
            ReadinessPanel()
            if state.isFirstTime { guided } else { dashboard }
        }
        .navigationBarHidden(true)
    }

    // Header
    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(state.isFirstTime ? "ようこそ" : "おかえり")
                        .font(.bapSecondary).foregroundColor(BAP.text2)
                    Text(state.player?.name ?? "").font(.bapTitle).foregroundColor(BAP.text)
                    if let school = state.player?.school, !school.isEmpty {
                        Text(school).font(.bapSecondary).foregroundColor(BAP.text3)
                    }
                }
                Spacer()
                if let gy = state.player?.gradYear {
                    VStack(spacing: 2) {
                        Text("\(gy)").font(.system(size: 30, weight: .bold)).foregroundColor(BAP.navy)
                        Text("卒業予定年").font(.system(size: 11)).foregroundColor(BAP.text3)
                    }
                }
            }
        }
        .padding(.horizontal, BAP.hPad)
        .padding(.top, 60)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BAP.white)
        .overlay(Divider().background(BAP.border), alignment: .bottom)
    }

    // First-time guided CTAs
    private var guided: some View {
        VStack(alignment: .leading, spacing: 0) {
            Section(title: "最初のタスクを追加") { AddTaskRow(text: $newTask) }
            VStack(spacing: 10) {
                NavigationLink { EditProfileView() } label: { primaryLabel("プロフィールを完成させる") }
                NavigationLink { AddContactView() } label: { secondaryLabel("コーチ連絡を追加") }
                NavigationLink { AddGoalView() } label: { secondaryLabel("目標を設定") }
            }
            .padding(.horizontal, BAP.hPad)
            .padding(.top, 24)
        }
    }

    // Returning-user dashboard
    private var dashboard: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Quick stats
            HStack(spacing: 8) {
                StatTile(value: "\(state.tasks.count)", label: "タスク")
                StatTile(value: "\(state.tasks.filter { $0.isDone }.count)", label: "完了")
                StatTile(value: "\(state.contacts.count)", label: "コーチ")
            }
            .padding(.horizontal, BAP.hPad)
            .padding(.top, 16)

            // Tasks
            Section(title: "今日のタスク",
                    trailing: state.tasks.isEmpty ? nil :
                        AnyView(Text("\(state.tasks.filter{$0.isDone}.count) / \(state.tasks.count) 完了")
                            .font(.bapMeta).foregroundColor(BAP.text3))) {
                if state.tasks.isEmpty {
                    EmptyStateCard(message: "タスクはまだありません")
                } else {
                    Card(padding: 0) {
                        VStack(spacing: 0) {
                            ForEach(state.tasks) { t in
                                TaskRow(task: t)
                                if t.id != state.tasks.last?.id { Divider().background(BAP.border).padding(.horizontal, 16) }
                            }
                        }
                    }
                }
                AddTaskRow(text: $newTask)
            }

            // Next event
            Section(title: "次のイベント") {
                let events = state.events.sorted { ($0.eventDate ?? "") < ($1.eventDate ?? "") }
                if events.isEmpty {
                    EmptyStateCard(message: "予定はまだありません")
                } else {
                    Card(padding: 0) {
                        VStack(spacing: 0) {
                            ForEach(events) { e in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(e.title ?? "").font(.bapCardTitle).foregroundColor(BAP.text)
                                        if let loc = e.location, !loc.isEmpty {
                                            Text(loc).font(.bapSecondary).foregroundColor(BAP.text3)
                                        }
                                    }
                                    Spacer()
                                    Text(DateUtil.relativeDays(e.eventDate))
                                        .font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                                }
                                .padding(14)
                                if e.id != events.last?.id { Divider().background(BAP.border).padding(.horizontal, 16) }
                            }
                        }
                    }
                }
            }
        }
    }

    private func primaryLabel(_ t: String) -> some View {
        Text(t).font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
            .frame(maxWidth: .infinity).frame(height: 50).background(BAP.blue)
            .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
    }
    private func secondaryLabel(_ t: String) -> some View {
        Text(t).font(.system(size: 15, weight: .semibold)).foregroundColor(BAP.text)
            .frame(maxWidth: .infinity).frame(height: 50).background(BAP.white)
            .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.borderMd, lineWidth: 1.5))
    }
}

// MARK: - Readiness panel

struct ReadinessPanel: View {
    @EnvironmentObject var state: AppState
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                SectionLabel("あなたのリクルート準備状況")
                Spacer()
                Text("\(state.readinessPct)%").font(.system(size: 22, weight: .bold)).foregroundColor(BAP.blue)
            }
            ProgressBar(value: Double(state.readinessPct) / 100)
            Card(padding: 0) {
                VStack(spacing: 0) {
                    ForEach(state.readiness) { item in
                        HStack(spacing: 10) {
                            Image(systemName: item.done ? "checkmark.circle.fill" : "exclamationmark.circle")
                                .font(.system(size: 16))
                                .foregroundColor(item.done ? BAP.success : BAP.warning)
                            Text(item.label).font(.bapBody)
                                .foregroundColor(item.done ? BAP.text2 : BAP.text)
                            Spacer()
                            if !item.done {
                                Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.blue)
                            }
                        }
                        .padding(.vertical, 12).padding(.horizontal, 16)
                        if item.id != state.readiness.last?.id { Divider().background(BAP.border).padding(.horizontal, 16) }
                    }
                }
            }
        }
        .padding(.horizontal, BAP.hPad)
        .padding(.top, 24)
    }
}

// MARK: - Pieces

struct StatTile: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 2) {
            Text(value).font(.system(size: 20, weight: .bold)).foregroundColor(BAP.navy)
            Text(label).font(.system(size: 11)).foregroundColor(BAP.text3)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 12)
        .background(BAP.white)
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(BAP.border, lineWidth: 1))
    }
}

struct TaskRow: View {
    @EnvironmentObject var state: AppState
    let task: PlayerTask
    var body: some View {
        HStack(spacing: 10) {
            Button { Task { await state.toggleTask(task) } } label: {
                ZStack {
                    RoundedRectangle(cornerRadius: 5).fill(task.isDone ? BAP.blue : Color.clear).frame(width: 20, height: 20)
                    RoundedRectangle(cornerRadius: 5).stroke(task.isDone ? BAP.blue : BAP.borderMd, lineWidth: 1.5).frame(width: 20, height: 20)
                    if task.isDone { Image(systemName: "checkmark").font(.system(size: 11, weight: .bold)).foregroundColor(.white) }
                }
            }.buttonStyle(.plain)
            Text(task.text).font(.system(size: 15))
                .foregroundColor(task.isDone ? BAP.text3 : BAP.text)
                .strikethrough(task.isDone, color: BAP.text3)
            Spacer()
            Button { Task { await state.deleteTask(task) } } label: {
                Image(systemName: "xmark").font(.system(size: 13, weight: .semibold)).foregroundColor(BAP.text3)
            }.buttonStyle(.plain)
        }
        .padding(.vertical, 13).padding(.horizontal, 16)
    }
}

struct AddTaskRow: View {
    @EnvironmentObject var state: AppState
    @Binding var text: String
    var body: some View {
        HStack(spacing: 8) {
            TextField("新しいタスク…", text: $text)
                .font(.bapBody).padding(.horizontal, 14).frame(height: 48)
                .background(BAP.white)
                .overlay(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous).stroke(BAP.border, lineWidth: 1.5))
                .onSubmit(add)
            Button(action: add) {
                Text("追加").font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                    .padding(.horizontal, 18).frame(height: 48).background(BAP.blue)
                    .clipShape(RoundedRectangle(cornerRadius: BAP.inputRadius, style: .continuous))
            }.buttonStyle(PressableStyle())
        }
    }
    private func add() {
        let t = text; text = ""
        Task { await state.addTask(t) }
    }
}
