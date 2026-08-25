import SwiftUI

/// Placeholder view for list detail — will be replaced with full implementation in Phase 3.
struct ListDetailPlaceholderView: View {
    let list: GatherList
    
    var body: some View {
        VStack(spacing: 16) {
            if let emoji = list.emoji, emoji.containsVisualEmoji {
                Text(emoji)
                    .font(.quicksand(size: 64))
            } else {
                Image(systemName: "list.bullet")
                    .font(.quicksand(size: 48))
                    .foregroundStyle(.secondary)
            }
            
            Text(list.name)
                .font(.quicksand(.title))
                .fontWeight(.semibold)
            
            Text("\(list.itemCount) items")
                .font(.quicksand(.subheadline))
                .foregroundStyle(.secondary)
            
            Text("Items view coming in Phase 3")
                .font(.quicksand(.caption))
                .foregroundStyle(.tertiary)
                .padding(.top, 24)
        }
        .navigationTitle(list.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
