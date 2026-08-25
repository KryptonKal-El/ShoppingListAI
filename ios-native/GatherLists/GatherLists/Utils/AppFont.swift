import SwiftUI

/// Brand typography: Quicksand for every text style (bundled in Fonts/, registered via UIAppFonts).
/// Mirrors the system text styles' base sizes so Dynamic Type scaling keeps working.
/// The widget extension intentionally stays on the system font (fonts aren't bundled there).
extension Font {
    /// Quicksand at a fixed size.
    static func quicksand(size: CGFloat, weight: Font.Weight = .medium) -> Font {
        .custom(quicksandName(for: weight), size: size)
    }

    /// Quicksand matched to a system text style, scaling with Dynamic Type.
    static func quicksand(_ style: Font.TextStyle, weight: Font.Weight? = nil) -> Font {
        .custom(
            quicksandName(for: weight ?? defaultWeight(for: style)),
            size: baseSize(for: style),
            relativeTo: style
        )
    }

    /// PostScript name of the bundled Quicksand face nearest the requested weight.
    static func quicksandName(for weight: Font.Weight) -> String {
        switch weight {
        case .black, .heavy, .bold: return "Quicksand-Bold"
        case .semibold: return "Quicksand-SemiBold"
        case .ultraLight, .thin, .light, .regular: return "Quicksand-Regular"
        default: return "Quicksand-Medium"
        }
    }

    private static func defaultWeight(for style: Font.TextStyle) -> Font.Weight {
        switch style {
        case .largeTitle: return .bold
        case .title, .title2, .title3, .headline: return .semibold
        default: return .medium
        }
    }

    // Default (Large) Dynamic Type base sizes for each style.
    private static func baseSize(for style: Font.TextStyle) -> CGFloat {
        switch style {
        case .largeTitle: return 34
        case .title: return 28
        case .title2: return 22
        case .title3: return 20
        case .headline: return 17
        case .body: return 17
        case .callout: return 16
        case .subheadline: return 15
        case .footnote: return 13
        case .caption: return 12
        case .caption2: return 11
        @unknown default: return 17
        }
    }
}

/// UIKit counterparts for appearance proxies (navigation and tab bars).
extension UIFont {
    /// Quicksand at a fixed size, for UIKit appearance APIs.
    static func quicksand(size: CGFloat, weight: Font.Weight = .medium) -> UIFont {
        UIFont(name: Font.quicksandName(for: weight), size: size)
            ?? .systemFont(ofSize: size)
    }
}
