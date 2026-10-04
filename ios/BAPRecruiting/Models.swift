//
//  Models.swift
//  BAP Recruiting
//
//  Codable models mirroring the Supabase schema, plus shared reference data
//  (the 80-school database and the recruiting glossary). No demo person lives
//  here — every per-player value is loaded from Supabase at runtime.
//

import SwiftUI

// MARK: - Player

struct Player: Codable, Identifiable {
    var id: String                 // == auth.uid()
    var name: String?
    var nameEn: String?
    var school: String?
    var position: String?
    var gradYear: Int?
    var gpa: Double?
    var heightCm: Double?
    var weightKg: Double?
    var throwsHand: String?
    var bats: String?

    enum CodingKeys: String, CodingKey {
        case id, name, school, position, gpa, bats
        case nameEn = "name_en"
        case gradYear = "grad_year"
        case heightCm = "height_cm"
        case weightKg = "weight_kg"
        case throwsHand = "throws"
    }

    var displayHeight: String { heightCm.map { "\(Int($0)) cm" } ?? "—" }
    var displayWeight: String { weightKg.map { "\(Int($0)) kg" } ?? "—" }
    var displayGPA: String { gpa.map { String(format: "%.1f", $0) } ?? "—" }
}

// MARK: - Tasks

struct PlayerTask: Codable, Identifiable {
    var id: String
    var text: String
    var status: String             // "open" | "done"
    var isDone: Bool { status == "done" }
}

// MARK: - Events

struct PlayerEvent: Codable, Identifiable {
    var id: String
    var title: String?
    var location: String?
    var eventDate: String?         // ISO yyyy-MM-dd
    enum CodingKeys: String, CodingKey {
        case id, title, location
        case eventDate = "event_date"
    }
}

// MARK: - Coach contacts + messages

enum ContactStatus: String, CaseIterable, Codable {
    case none, sent, opened, replied, interest, meeting, closed

    var label: String {
        switch self {
        case .none:     return "未送信"
        case .sent:     return "送信済み"
        case .opened:   return "開封済み"
        case .replied:  return "返信あり"
        case .interest: return "興味あり"
        case .meeting:  return "面談予定"
        case .closed:   return "終了"
        }
    }
    var badge: Badge.Kind {
        switch self {
        case .none:     return .gray
        case .sent:     return .blue
        case .opened:   return .amber
        case .replied:  return .green
        case .interest: return .purple
        case .meeting:  return .green
        case .closed:   return .gray
        }
    }
}

struct CoachContact: Codable, Identifiable {
    var id: String
    var coachName: String?
    var coachRole: String?
    var coachEmail: String?
    var status: String?
    var nextAction: String?
    var note: String?
    var collegeId: Int?
    var lastActivityAt: String?

    enum CodingKeys: String, CodingKey {
        case id, status, note
        case coachName = "coach_name"
        case coachRole = "coach_role"
        case coachEmail = "coach_email"
        case nextAction = "next_action"
        case collegeId = "college_id"
        case lastActivityAt = "last_activity_at"
    }
    var statusEnum: ContactStatus { ContactStatus(rawValue: status ?? "none") ?? .none }
}

struct CoachMessage: Codable, Identifiable {
    var id: String
    var contactId: String
    var direction: String          // "outbound" | "inbound"
    var body: String?
    var sentAt: String?
    enum CodingKeys: String, CodingKey {
        case id, direction, body
        case contactId = "contact_id"
        case sentAt = "sent_at"
    }
    var isMine: Bool { direction == "outbound" }
}

// MARK: - Metrics, goals, documents, videos

struct Metric: Codable, Identifiable {
    var id: String
    var metricKey: String?
    var value: Double?
    var unit: String?
    var measuredAt: String?
    enum CodingKeys: String, CodingKey {
        case id, value, unit
        case metricKey = "metric_key"
        case measuredAt = "measured_at"
    }
}

struct Goal: Codable, Identifiable {
    var id: String
    var label: String?
    var currentVal: Double?
    var targetVal: Double?
    var unit: String?
    enum CodingKeys: String, CodingKey {
        case id, label, unit
        case currentVal = "current_val"
        case targetVal = "target_val"
    }
}

struct RecruitingDocument: Codable, Identifiable {
    var id: String
    var label: String?
    var kind: String?
    var status: String?            // "complete" | "missing" | "pending"
}

struct PlayerVideo: Codable, Identifiable {
    var id: String
    var title: String?
    var kind: String?
    var status: String?
}

struct SavedCollege: Codable, Identifiable {
    var id: String
    var collegeId: Int
    enum CodingKeys: String, CodingKey {
        case id
        case collegeId = "college_id"
    }
}

// MARK: - Scores (single row per player)

struct PlayerScores: Codable {
    var readiness: Int
    var scores: [String: Int]
    var divisionFit: [DivisionFit]?
    enum CodingKeys: String, CodingKey {
        case readiness, scores
        case divisionFit = "division_fit"
    }
}
struct DivisionFit: Codable, Identifiable {
    var id: String { division }
    var division: String
    var label: String
}

let scoreLabels: [String: String] = [
    "academics": "学業成績", "baseball": "野球指標", "video": "動画",
    "outreach": "コーチ連絡", "english": "英語力", "consistency": "一貫性",
]

// MARK: - College reference DB (80 schools)

struct College: Identifiable, Hashable {
    let id: Int
    let name: String
    let city: String
    let state: String
    let div: String
    let conf: String
    let tuition: Int
    let intl: Bool
    let gpa: Double
    let roster: Int
    let scholarship: Bool

    var tuitionLabel: String { tuition >= 1000 ? "$\(tuition/1000)k" : "$\(tuition)" }

    /// Simplified fit estimate (mirrors the original rough draft's logic).
    var matchPct: Int {
        var base = 60
        switch div {
        case "D2": base = 78
        case "D3": base = 72
        case "NAIA": base = 74
        case "JUCO": base = 65
        default: break
        }
        if intl { base += 5 }
        if state == "FL" { base += 4 }
        if tuition <= 30000 { base += 3 }
        return min(92, max(55, base + (id % 7) - 3))
    }
}

// MARK: - Glossary

struct VocabItem: Identifiable {
    var id: String { en }
    let en: String
    let ja: String
    let desc: String
}

let vocab: [VocabItem] = [
    .init(en: "Exit Velocity", ja: "打球初速", desc: "バットとボールが当たった瞬間の打球スピード（mph）。コーチはこれでパワーを評価します。"),
    .init(en: "Recruiting Dead Period", ja: "接触禁止期間", desc: "NCAAが定めた、コーチが選手と直接会うことができない期間。メール連絡はOK。"),
    .init(en: "Official Visit", ja: "公式訪問", desc: "大学が旅費を負担するキャンパス訪問。1校に対して1回のみ認められています。"),
    .init(en: "Verbal Commitment", ja: "口頭コミット", desc: "選手が特定の大学への進学を口頭で約束すること。法的な拘束力はありません。"),
    .init(en: "National Letter of Intent", ja: "NLI（入学意思表示書）", desc: "署名後は奨学金が正式に確定します。他校への転校にはペナルティが伴います。"),
    .init(en: "Showcase", ja: "ショーケース", desc: "複数の大学コーチの前でプレーを披露するイベント。リクルーティングの大きな機会。"),
    .init(en: "Walk-on", ja: "ウォークオン", desc: "奨学金なしでチームに入ること。実力次第で後から奨学金を獲得できる場合もあります。"),
    .init(en: "Redshirt", ja: "レッドシャート", desc: "1年間試合に出ずにトレーニングに専念すること。在籍可能年数には影響しません。"),
    .init(en: "Transfer Portal", ja: "転校登録システム", desc: "現チームに通知してから他校への転校を申請するNCAAの公式システム。"),
    .init(en: "GPA", ja: "成績平均点（GPA）", desc: "4.0満点。NCAA D1では最低2.3、D2では最低2.2が必要です。"),
]

// MARK: - Recruiting timeline template
//
//  Stage tasks ship UNCHECKED. Each player's progress is stored per-account
//  (CollegeTimelineStore), so no demo "done" marks appear for a new client.

struct TimelineStage: Identifiable {
    var id: String { label }
    let label: String
    let active: Bool
    let items: [String]
}

let timelineTemplate: [TimelineStage] = [
    .init(label: "2年生（現在）", active: true, items: [
        "リクルーティング動画を作成する",
        "BAPプロフィールを完成させる",
        "25校のコーチにメールを送る",
        "キャンパス訪問またはバーチャル訪問",
        "NCAA Eligibility Centerに登録する",
        "TOEFL 80以上を取得する",
    ]),
    .init(label: "3年生", active: false, items: [
        "ショーケースに2〜3本参加する",
        "オフィシャルビジットを計画する",
        "奨学金オファーを比較・検討する",
        "学費と奨学金の試算を行う",
        "口頭コミットの判断をする",
    ]),
    .init(label: "4年生", active: false, items: [
        "NLI（入学意思表示書）に署名する",
        "ビザ申請手続きを開始する",
        "渡航・引越しの準備をする",
        "寮・生活費の準備をする",
    ]),
]

// MARK: - The 80-school database

let collegeDB: [College] = [
    // D1
    College(id: 1,  name: "UCLA", city: "Los Angeles", state: "CA", div: "D1", conf: "Pac-12", tuition: 44000, intl: true, gpa: 3.5, roster: 35, scholarship: true),
    College(id: 2,  name: "Stanford University", city: "Stanford", state: "CA", div: "D1", conf: "Pac-12", tuition: 58000, intl: true, gpa: 3.8, roster: 35, scholarship: true),
    College(id: 3,  name: "Louisiana State Univ.", city: "Baton Rouge", state: "LA", div: "D1", conf: "SEC", tuition: 31000, intl: false, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 4,  name: "Vanderbilt University", city: "Nashville", state: "TN", div: "D1", conf: "SEC", tuition: 60000, intl: true, gpa: 3.6, roster: 35, scholarship: true),
    College(id: 5,  name: "University of Texas", city: "Austin", state: "TX", div: "D1", conf: "Big 12", tuition: 38000, intl: false, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 6,  name: "University of Florida", city: "Gainesville", state: "FL", div: "D1", conf: "SEC", tuition: 28000, intl: true, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 7,  name: "Arizona State Univ.", city: "Tempe", state: "AZ", div: "D1", conf: "Pac-12", tuition: 29000, intl: true, gpa: 2.5, roster: 35, scholarship: true),
    College(id: 8,  name: "Cal State Fullerton", city: "Fullerton", state: "CA", div: "D1", conf: "Big West", tuition: 20000, intl: true, gpa: 2.5, roster: 35, scholarship: true),
    College(id: 9,  name: "Long Beach State", city: "Long Beach", state: "CA", div: "D1", conf: "Big West", tuition: 19000, intl: true, gpa: 2.5, roster: 35, scholarship: true),
    College(id: 10, name: "TCU", city: "Fort Worth", state: "TX", div: "D1", conf: "Big 12", tuition: 54000, intl: false, gpa: 3.2, roster: 35, scholarship: true),
    College(id: 11, name: "Florida State Univ.", city: "Tallahassee", state: "FL", div: "D1", conf: "ACC", tuition: 21000, intl: false, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 12, name: "Clemson University", city: "Clemson", state: "SC", div: "D1", conf: "ACC", tuition: 38000, intl: false, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 13, name: "Univ. of North Carolina", city: "Chapel Hill", state: "NC", div: "D1", conf: "ACC", tuition: 34000, intl: true, gpa: 3.2, roster: 35, scholarship: true),
    College(id: 14, name: "University of Virginia", city: "Charlottesville", state: "VA", div: "D1", conf: "ACC", tuition: 52000, intl: true, gpa: 3.5, roster: 35, scholarship: true),
    College(id: 15, name: "Notre Dame", city: "Notre Dame", state: "IN", div: "D1", conf: "ACC", tuition: 60000, intl: true, gpa: 3.5, roster: 35, scholarship: true),
    College(id: 16, name: "Gonzaga University", city: "Spokane", state: "WA", div: "D1", conf: "WCC", tuition: 52000, intl: true, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 17, name: "Pepperdine University", city: "Malibu", state: "CA", div: "D1", conf: "WCC", tuition: 58000, intl: true, gpa: 3.2, roster: 35, scholarship: true),
    College(id: 18, name: "Univ. of San Diego", city: "San Diego", state: "CA", div: "D1", conf: "WCC", tuition: 54000, intl: true, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 19, name: "Univ. of Connecticut", city: "Storrs", state: "CT", div: "D1", conf: "Big East", tuition: 42000, intl: true, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 20, name: "Seton Hall University", city: "South Orange", state: "NJ", div: "D1", conf: "Big East", tuition: 52000, intl: true, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 21, name: "University of Louisville", city: "Louisville", state: "KY", div: "D1", conf: "ACC", tuition: 30000, intl: false, gpa: 2.8, roster: 35, scholarship: true),
    College(id: 22, name: "Georgia Tech", city: "Atlanta", state: "GA", div: "D1", conf: "ACC", tuition: 34000, intl: true, gpa: 3.5, roster: 35, scholarship: true),
    College(id: 23, name: "University of Miami", city: "Coral Gables", state: "FL", div: "D1", conf: "ACC", tuition: 58000, intl: true, gpa: 3.0, roster: 35, scholarship: true),
    College(id: 24, name: "Oregon State Univ.", city: "Corvallis", state: "OR", div: "D1", conf: "Pac-12", tuition: 32000, intl: false, gpa: 2.8, roster: 35, scholarship: true),
    College(id: 25, name: "Univ. of Southern Cal.", city: "Los Angeles", state: "CA", div: "D1", conf: "Pac-12", tuition: 62000, intl: true, gpa: 3.5, roster: 35, scholarship: true),
    // D2
    College(id: 26, name: "University of Tampa", city: "Tampa", state: "FL", div: "D2", conf: "SSC", tuition: 32400, intl: true, gpa: 2.5, roster: 28, scholarship: true),
    College(id: 27, name: "Rollins College", city: "Winter Park", state: "FL", div: "D2", conf: "SSC", tuition: 36800, intl: true, gpa: 3.0, roster: 24, scholarship: true),
    College(id: 28, name: "Florida Southern", city: "Lakeland", state: "FL", div: "D2", conf: "SSC", tuition: 30000, intl: true, gpa: 2.5, roster: 30, scholarship: true),
    College(id: 29, name: "Nova Southeastern", city: "Davie", state: "FL", div: "D2", conf: "SSC", tuition: 35000, intl: true, gpa: 2.5, roster: 28, scholarship: true),
    College(id: 30, name: "Barry University", city: "Miami Shores", state: "FL", div: "D2", conf: "SSC", tuition: 30000, intl: true, gpa: 2.5, roster: 26, scholarship: true),
    College(id: 31, name: "Palm Beach Atlantic", city: "West Palm Beach", state: "FL", div: "D2", conf: "SSC", tuition: 34000, intl: false, gpa: 2.5, roster: 24, scholarship: true),
    College(id: 32, name: "St. Leo University", city: "St. Leo", state: "FL", div: "D2", conf: "SSC", tuition: 28000, intl: true, gpa: 2.3, roster: 28, scholarship: true),
    College(id: 33, name: "Lynn University", city: "Boca Raton", state: "FL", div: "D2", conf: "SSC", tuition: 34500, intl: true, gpa: 2.5, roster: 26, scholarship: true),
    College(id: 34, name: "Embry-Riddle Univ.", city: "Daytona Beach", state: "FL", div: "D2", conf: "SSC", tuition: 40200, intl: true, gpa: 3.0, roster: 22, scholarship: true),
    College(id: 35, name: "Southern New Hampshire", city: "Manchester", state: "NH", div: "D2", conf: "NE10", tuition: 15000, intl: false, gpa: 2.5, roster: 30, scholarship: true),
    College(id: 36, name: "Assumption University", city: "Worcester", state: "MA", div: "D2", conf: "NE10", tuition: 42000, intl: false, gpa: 2.8, roster: 26, scholarship: true),
    College(id: 37, name: "Le Moyne College", city: "Syracuse", state: "NY", div: "D2", conf: "NE10", tuition: 38000, intl: false, gpa: 3.0, roster: 26, scholarship: true),
    College(id: 38, name: "Adelphi University", city: "Garden City", state: "NY", div: "D2", conf: "ECC", tuition: 40000, intl: true, gpa: 2.5, roster: 28, scholarship: true),
    College(id: 39, name: "Mercy University", city: "Dobbs Ferry", state: "NY", div: "D2", conf: "ECC", tuition: 34000, intl: true, gpa: 2.5, roster: 24, scholarship: true),
    College(id: 40, name: "Colorado Mesa Univ.", city: "Grand Junction", state: "CO", div: "D2", conf: "RMAC", tuition: 22000, intl: false, gpa: 2.0, roster: 30, scholarship: true),
    College(id: 41, name: "Colorado State Pueblo", city: "Pueblo", state: "CO", div: "D2", conf: "RMAC", tuition: 20000, intl: false, gpa: 2.0, roster: 30, scholarship: true),
    College(id: 42, name: "Cal State San Marcos", city: "San Marcos", state: "CA", div: "D2", conf: "CCAA", tuition: 20000, intl: true, gpa: 2.0, roster: 28, scholarship: false),
    College(id: 43, name: "Sonoma State Univ.", city: "Rohnert Park", state: "CA", div: "D2", conf: "CCAA", tuition: 20000, intl: true, gpa: 2.0, roster: 28, scholarship: false),
    College(id: 44, name: "Ohio Dominican Univ.", city: "Columbus", state: "OH", div: "D2", conf: "G-MAC", tuition: 28600, intl: false, gpa: 2.5, roster: 32, scholarship: true),
    College(id: 45, name: "Lindenwood University", city: "St. Charles", state: "MO", div: "D2", conf: "MIAA", tuition: 18000, intl: false, gpa: 2.0, roster: 34, scholarship: true),
    // D3
    College(id: 46, name: "Trinity University", city: "San Antonio", state: "TX", div: "D3", conf: "SCAC", tuition: 48000, intl: true, gpa: 3.5, roster: 28, scholarship: false),
    College(id: 47, name: "Emory University", city: "Atlanta", state: "GA", div: "D3", conf: "UAA", tuition: 56000, intl: true, gpa: 3.7, roster: 28, scholarship: false),
    College(id: 48, name: "New York University", city: "New York", state: "NY", div: "D3", conf: "UAA", tuition: 58000, intl: true, gpa: 3.5, roster: 26, scholarship: false),
    College(id: 49, name: "Williams College", city: "Williamstown", state: "MA", div: "D3", conf: "NESCAC", tuition: 62000, intl: true, gpa: 3.8, roster: 28, scholarship: false),
    College(id: 50, name: "Amherst College", city: "Amherst", state: "MA", div: "D3", conf: "NESCAC", tuition: 64000, intl: true, gpa: 3.8, roster: 28, scholarship: false),
    College(id: 51, name: "Middlebury College", city: "Middlebury", state: "VT", div: "D3", conf: "NESCAC", tuition: 62000, intl: true, gpa: 3.6, roster: 28, scholarship: false),
    College(id: 52, name: "Tufts University", city: "Medford", state: "MA", div: "D3", conf: "NESCAC", tuition: 62000, intl: true, gpa: 3.7, roster: 28, scholarship: false),
    College(id: 53, name: "Johns Hopkins Univ.", city: "Baltimore", state: "MD", div: "D3", conf: "Centennial", tuition: 60000, intl: true, gpa: 3.8, roster: 26, scholarship: false),
    College(id: 54, name: "Chapman University", city: "Orange", state: "CA", div: "D3", conf: "SCIAC", tuition: 56000, intl: true, gpa: 3.3, roster: 26, scholarship: false),
    College(id: 55, name: "Claremont-Mudd-Scripps", city: "Claremont", state: "CA", div: "D3", conf: "SCIAC", tuition: 60000, intl: true, gpa: 3.7, roster: 28, scholarship: false),
    College(id: 56, name: "Univ. of Rochester", city: "Rochester", state: "NY", div: "D3", conf: "UAA", tuition: 60000, intl: true, gpa: 3.5, roster: 28, scholarship: false),
    College(id: 57, name: "Carnegie Mellon Univ.", city: "Pittsburgh", state: "PA", div: "D3", conf: "UAA", tuition: 60000, intl: true, gpa: 3.8, roster: 26, scholarship: false),
    College(id: 58, name: "Brandeis University", city: "Waltham", state: "MA", div: "D3", conf: "UAA", tuition: 58000, intl: true, gpa: 3.5, roster: 26, scholarship: false),
    College(id: 59, name: "Bowdoin College", city: "Brunswick", state: "ME", div: "D3", conf: "NESCAC", tuition: 62000, intl: true, gpa: 3.7, roster: 28, scholarship: false),
    College(id: 60, name: "Pomona College", city: "Claremont", state: "CA", div: "D3", conf: "SCIAC", tuition: 60000, intl: true, gpa: 3.8, roster: 26, scholarship: false),
    // NAIA
    College(id: 61, name: "Tennessee Wesleyan", city: "Athens", state: "TN", div: "NAIA", conf: "AAC", tuition: 25000, intl: true, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 62, name: "Cumberland University", city: "Lebanon", state: "TN", div: "NAIA", conf: "MSC", tuition: 24000, intl: true, gpa: 2.0, roster: 30, scholarship: true),
    College(id: 63, name: "Freed-Hardeman Univ.", city: "Henderson", state: "TN", div: "NAIA", conf: "MSC", tuition: 26000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 64, name: "Faulkner University", city: "Montgomery", state: "AL", div: "NAIA", conf: "AAC", tuition: 22000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 65, name: "Benedictine College", city: "Atchison", state: "KS", div: "NAIA", conf: "HAAC", tuition: 28000, intl: true, gpa: 2.5, roster: 28, scholarship: true),
    College(id: 66, name: "Southeastern Univ.", city: "Lakeland", state: "FL", div: "NAIA", conf: "AAC", tuition: 26000, intl: true, gpa: 2.0, roster: 26, scholarship: true),
    College(id: 67, name: "Keiser University", city: "Fort Lauderdale", state: "FL", div: "NAIA", conf: "SSC", tuition: 20000, intl: true, gpa: 2.0, roster: 24, scholarship: true),
    College(id: 68, name: "Ave Maria University", city: "Ave Maria", state: "FL", div: "NAIA", conf: "SSC", tuition: 24000, intl: false, gpa: 2.5, roster: 26, scholarship: true),
    College(id: 69, name: "Lyon College", city: "Batesville", state: "AR", div: "NAIA", conf: "AMC", tuition: 24000, intl: false, gpa: 2.0, roster: 26, scholarship: true),
    College(id: 70, name: "Blue Mountain College", city: "Blue Mountain", state: "MS", div: "NAIA", conf: "MSC", tuition: 18000, intl: false, gpa: 2.0, roster: 24, scholarship: true),
    // JUCO
    College(id: 71, name: "Chipola College", city: "Marianna", state: "FL", div: "JUCO", conf: "FCSAA", tuition: 4000, intl: false, gpa: 2.0, roster: 30, scholarship: true),
    College(id: 72, name: "Palm Beach State", city: "Lake Worth", state: "FL", div: "JUCO", conf: "FCSAA", tuition: 3000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 73, name: "Tallahassee CC", city: "Tallahassee", state: "FL", div: "JUCO", conf: "FCSAA", tuition: 3000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 74, name: "Indian Hills CC", city: "Ottumwa", state: "IA", div: "JUCO", conf: "ICCAC", tuition: 5000, intl: false, gpa: 2.0, roster: 30, scholarship: true),
    College(id: 75, name: "Iowa Western CC", city: "Council Bluffs", state: "IA", div: "JUCO", conf: "ICCAC", tuition: 5000, intl: false, gpa: 2.0, roster: 30, scholarship: true),
    College(id: 76, name: "Crowder College", city: "Neosho", state: "MO", div: "JUCO", conf: "MACJC", tuition: 6000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 77, name: "McLennan CC", city: "Waco", state: "TX", div: "JUCO", conf: "WJCAC", tuition: 4000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 78, name: "San Jacinto College", city: "Pasadena", state: "TX", div: "JUCO", conf: "WJCAC", tuition: 4000, intl: false, gpa: 2.0, roster: 28, scholarship: true),
    College(id: 79, name: "Walters State CC", city: "Morristown", state: "TN", div: "JUCO", conf: "TCCAA", tuition: 5000, intl: false, gpa: 2.0, roster: 26, scholarship: true),
    College(id: 80, name: "Kaskaskia College", city: "Centralia", state: "IL", div: "JUCO", conf: "MWJCAC", tuition: 5000, intl: false, gpa: 2.0, roster: 26, scholarship: true),
]

let allStates: [String] = Array(Set(collegeDB.map { $0.state })).sorted()

// MARK: - Date helpers

enum DateUtil {
    static func daysUntil(_ iso: String?) -> Int? {
        guard let iso, let date = parse(iso) else { return nil }
        let cal = Calendar.current
        let from = cal.startOfDay(for: Date())
        let to = cal.startOfDay(for: date)
        return cal.dateComponents([.day], from: from, to: to).day
    }
    static func relativeDays(_ iso: String?) -> String {
        guard let d = daysUntil(iso) else { return "" }
        if d == 0 { return "今日" }
        return d > 0 ? "\(d)日後" : "\(abs(d))日前"
    }
    private static func parse(_ s: String) -> Date? {
        let f = ISO8601DateFormatter()
        if let d = f.date(from: s) { return d }
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        return df.date(from: s)
    }
}
