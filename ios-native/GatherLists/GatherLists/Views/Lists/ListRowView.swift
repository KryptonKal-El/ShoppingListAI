import SwiftUI

/// A row displaying a single list with emoji, name, item count, and collaborator avatars.
struct ListRowView: View {
    let list: GatherList
    let isShared: Bool
    var collaborators: [Profile] = []
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color(hex: list.color))
                .frame(width: 12, height: 12)
            
            if let emoji = list.emoji, emoji.containsVisualEmoji {
                Text(emoji)
                    .font(.quicksand(.title2))
                    .alignmentGuide(.listRowSeparatorLeading) { d in d[.leading] }
            } else {
                Image(systemName: "list.bullet")
                    .font(.quicksand(.title3))
                    .foregroundStyle(.secondary)
                    .alignmentGuide(.listRowSeparatorLeading) { d in d[.leading] }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(list.name)
                    .font(.quicksand(.body))
                    .lineLimit(1)
                
                HStack(spacing: 6) {
                    Text("\(list.itemCount) items")
                        .font(.quicksand(.caption))
                        .foregroundStyle(.secondary)
                    
                    Text("·")
                        .font(.quicksand(.caption))
                        .foregroundStyle(.secondary)
                    
                    Text(ListTypes.getConfig(list.type).label)
                        .font(.quicksand(.caption))
                        .foregroundStyle(.secondary)
                }
            }
            .layoutPriority(1)
            
            Spacer()
            
            if !collaborators.isEmpty {
                AvatarGroupView(
                    collaborators: collaborators,
                    size: 28,
                    color: Color(hex: list.color)
                )
            }
        }
        .contentShape(Rectangle())
    }
}
