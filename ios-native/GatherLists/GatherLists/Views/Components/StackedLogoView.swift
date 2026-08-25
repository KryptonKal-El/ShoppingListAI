import SwiftUI

/// The stacked brand logo: the tile-free glyph (blush check-hearts bulleting sage list
/// lines) above the "Gather Lists" wordmark and tagline. Mirrors public/logo/stacked.svg.
struct StackedLogoView: View {
    var scale: CGFloat = 1.0

    private let primaryTextColor = Color(hex: "#3D7A63")
    private let secondaryTextColor = Color(hex: "#85BFA8")
    private let heartColor = Color(hex: "#F9A8C9")
    private let heartShadowColor = Color(hex: "#2C5C4A")

    var body: some View {
        VStack(spacing: 14 * scale) {
            glyphView
            VStack(spacing: 6 * scale) {
                titleText
                taglineText
            }
        }
    }

    private var glyphView: some View {
        VStack(alignment: .leading, spacing: 16 * scale) {
            glyphRow
            glyphRow
            glyphRow
        }
    }

    private var glyphRow: some View {
        HStack(spacing: 9 * scale) {
            checkHeart
            RoundedRectangle(cornerRadius: 6.5 * scale)
                .fill(secondaryTextColor)
                .frame(width: 96 * scale, height: 13 * scale)
        }
    }

    private var checkHeart: some View {
        ZStack {
            HeartShape()
                .fill(heartColor)
            CheckShape()
                .stroke(
                    Color.white,
                    style: StrokeStyle(lineWidth: 3.4 * scale, lineCap: .round, lineJoin: .round)
                )
        }
        .frame(width: 28 * scale, height: 27 * scale)
        .shadow(color: heartShadowColor.opacity(0.3), radius: 1.5 * scale, x: 0, y: 1.5 * scale)
    }

    private var titleText: some View {
        HStack(alignment: .firstTextBaseline, spacing: 0) {
            Text("Gather ")
                .font(.quicksand(size: 52 * scale, weight: .semibold))
                .foregroundColor(primaryTextColor)
                .tracking(-1 * scale)

            Text("Lists")
                .font(.quicksand(size: 28 * scale, weight: .medium))
                .foregroundColor(secondaryTextColor)
                .tracking(-1 * scale)
        }
    }

    private var taglineText: some View {
        Text("Gather your lists, meals, and more.")
            .font(.quicksand(size: 13.5 * scale, weight: .medium))
            .foregroundColor(secondaryTextColor)
            .tracking(0.4 * scale)
    }
}

private struct HeartShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()

        let w = rect.width
        let h = rect.height

        let scaleX = w / 32
        let scaleY = h / 31

        path.move(to: CGPoint(x: 16 * scaleX, y: 31 * scaleY))

        path.addCurve(
            to: CGPoint(x: 0 * scaleX, y: 10 * scaleY),
            control1: CGPoint(x: 16 * scaleX, y: 31 * scaleY),
            control2: CGPoint(x: 0 * scaleX, y: 20 * scaleY)
        )

        path.addCurve(
            to: CGPoint(x: 8 * scaleX, y: 0 * scaleY),
            control1: CGPoint(x: 0 * scaleX, y: 4 * scaleY),
            control2: CGPoint(x: 4 * scaleX, y: 0 * scaleY)
        )

        path.addCurve(
            to: CGPoint(x: 16 * scaleX, y: 5 * scaleY),
            control1: CGPoint(x: 11 * scaleX, y: 0 * scaleY),
            control2: CGPoint(x: 14 * scaleX, y: 3 * scaleY)
        )

        path.addCurve(
            to: CGPoint(x: 24 * scaleX, y: 0 * scaleY),
            control1: CGPoint(x: 18 * scaleX, y: 3 * scaleY),
            control2: CGPoint(x: 21 * scaleX, y: 0 * scaleY)
        )

        path.addCurve(
            to: CGPoint(x: 32 * scaleX, y: 10 * scaleY),
            control1: CGPoint(x: 28 * scaleX, y: 0 * scaleY),
            control2: CGPoint(x: 32 * scaleX, y: 4 * scaleY)
        )

        path.addCurve(
            to: CGPoint(x: 16 * scaleX, y: 31 * scaleY),
            control1: CGPoint(x: 32 * scaleX, y: 20 * scaleY),
            control2: CGPoint(x: 16 * scaleX, y: 31 * scaleY)
        )

        path.closeSubpath()

        return path
    }
}

/// The white checkmark inside each heart bullet.
private struct CheckShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        path.move(to: CGPoint(x: 0.28 * w, y: 0.47 * h))
        path.addLine(to: CGPoint(x: 0.45 * w, y: 0.65 * h))
        path.addLine(to: CGPoint(x: 0.73 * w, y: 0.30 * h))
        return path
    }
}

#Preview {
    VStack(spacing: 40) {
        StackedLogoView()
        StackedLogoView(scale: 0.5)
    }
    .padding()
}

#Preview("Dark Mode") {
    VStack(spacing: 40) {
        StackedLogoView()
        StackedLogoView(scale: 0.5)
    }
    .padding()
    .preferredColorScheme(.dark)
}
