{
  "prompt": {
    "app_name": "FlavorWheel",
    "description": "Create the file structure and landing page for the FlavorWheel mobile app based on the following details. The app is built using Node.js for development, TypeScript for type safety, and Next.js for the frontend, targeting a mobile-first approach. The landing page serves as the starting point for building the app, with no functionalities implemented yet—just the structure and static UI layout optimized for mobile screens (e.g., 375x667px for iPhone SE). Use the provided MVP JSON, CSS design system, and attached PDF snippets (Quick Tasting, Create Tasting) as the foundation. The design should reflect a Mexican-inspired aesthetic with warm colors and fluid typography, ensuring a seamless mobile experience.",
    "mvp_context": {
      "app_name": "FlavorWheel",
      "overview": "FlavorWheel is the world's most pivotal tasting app for coffee and drinks, with a goal of becoming the most user-friendly tasting app the world has ever seen. It serves as a versatile tool for conducting tastings and reviews of anything with flavor or aroma, blending ease for casual users with powerful customization for industry experts. At its core, it leverages user-generated data to create dynamic flavor wheels that visualize perceptions of aroma and flavor, fostering a community-driven database of sensory insights.",
      "key_objectives": [
        "Empower users to easily log, analyze, and share tasting experiences across industries like wine, beer, spirits, coffee, olive oil, and perfume.",
        "Generate valuable data visualizations through flavor wheels, turning subjective notes into actionable, shareable insights.",
        "Support both informal study sessions and formal competitions, with options for blind tastings and rankings."
      ],
      "core_features": {
        "user_profile_and_social": "Users create profiles with usernames, photos, bios, and track posts, followers, and activity. Features include a feed for shared content, messaging, and search functionality to build a social tasting community.",
        "quick_tasting": "A streamlined mode for on-the-fly solo tastings: Add items with names, photos, aroma, flavor, other notes, and an overall score (0-100 slider). No pre-setup required, focusing on subjective inputs for simplicity.",
        "create_tasting": "Customizable tastings in Study Mode (quick setup for informal groups) or Competition Mode (preloaded items for accuracy ranking). Define participants, items, characteristics (e.g., variety, region), and assessment methods (exact answer, multiple choice, sliding scale, subjective). Includes blind/not blind options and ranking for participants or items.",
        "review_system": "Quick Reviews with structured categories (aroma intensity, salt, umami, etc., via sliders and notes) or Prose Reviews (free-text with AI extraction of descriptors). Core inputs include item name, picture, batch ID, category dropdown, and production date.",
        "flavor_wheels": "AI-generated visualizations from user data: Aroma, Flavor, Combined, and Metaphor wheels (e.g., moods, textures). Available at personal or universal levels, with filters by item, category, user demographics. Includes molecule info for deeper insights.",
        "additional_tools": "Tasting history with PDF exports, blind tasting scores, join tastings via codes, and templates based on industry standards (e.g., CMS Wine Grid, SCA Coffee)."
      },
      "target_audience": "Casual enthusiasts tasting coffee or drinks at home, industry professionals conducting blind tastings or competitions, and groups studying flavors collaboratively. Designed to be intuitive for all, with scalability for experts.",
      "unique_value": "By combining social networking, customizable tastings, and AI-driven visualizations, FlavorWheel transforms tasting into an effortless, insightful experience—making every sip a step toward the ultimate user-friendly sensory adventure.",
      "technical_highlights": "Built on a database that parses user inputs for wheels, with AI handling descriptor extraction and metaphor categorization. Fully cross-industry adaptable, emphasizing data privacy and seamless mobile integration."
    },
    "css_design_system": {
      "metadata": {
        "name": "FlavorWheel Design System",
        "version": "1.0.0",
        "description": "Mexican-inspired design system with warm colors, fluid typography, and mobile-first approach",
        "created": "2025-09-15",
        "inspiration": "Mexican heritage, mezcal tradition, warm desert landscapes"
      },
      "colors": {
        "brand": {
          "primary": "#1F5D4C",
          "primary-hover": "#2E7D32",
          "secondary": "#D4AF37",
          "secondary-hover": "#E6C84A",
          "accent": "#C65A2E",
          "accent-hover": "#D6743A"
        },
        "background": {
          "app": "#FEF3E7",
          "surface": "#FFFFFF",
          "surface-secondary": "#F7F3EA",
          "muted": "#F4E3CC",
          "dark": "#161614"
        },
        "text": {
          "primary": "#2C1810",
          "secondary": "#5C5C5C",
          "muted": "#8B8B8B",
          "inverse": "#FFFFFF"
        },
        "border": {
          "subtle": "rgba(0,0,0,0.08)",
          "default": "rgba(0,0,0,0.12)",
          "strong": "rgba(0,0,0,0.20)",
          "focus": "#1F5D4C"
        },
        "semantic": {
          "success": "#22C55E",
          "warning": "#F59E0B",
          "error": "#EF4444",
          "info": "#3B82F6"
        },
        "flavor_wheel": {
          "fruity": "#E4572E",
          "floral": "#E9A2AD",
          "vegetal": "#57A773",
          "smoky": "#6B5B95",
          "sweet": "#DFAF2B",
          "spicy": "#B53F3F",
          "bitter": "#2F4858",
          "sour": "#3B9ED8",
          "roasted": "#8C5A3A",
          "nutty": "#C29F6D",
          "mineral": "#7A8A8C",
          "earthy": "#6D7F4B"
        }
      },
      "typography": {
        "fonts": {
          "heading": {
            "family": "Crimson Text Variable, ui-serif, Georgia",
            "weights": [400, 600, 700]
          },
          "body": {
            "family": "Inter Variable, system-ui, -apple-system, sans-serif",
            "weights": [400, 500, 600]
          }
        },
        "scales": {
          "h1": "clamp(22px, 5vw, 28px)",
          "h2": "clamp(18px, 4vw, 24px)",
          "h3": "clamp(16px, 3.5vw, 20px)",
          "body": "16px",
          "small": "clamp(14px, 2.5vw, 15px)",
          "caption": "clamp(12px, 2vw, 13px)"
        },
        "line_heights": {
          "heading": 1.3,
          "body": 1.6,
          "snug": 1.4
        }
      },
      "spacing": {
        "base_unit": "8px",
        "scale": {
          "0": "0px",
          "1": "4px",
          "2": "8px",
          "3": "12px",
          "4": "16px",
          "5": "20px",
          "6": "24px",
          "8": "32px",
          "10": "40px",
          "12": "48px",
          "16": "64px"
        },
        "component_spacing": {
          "button": {
            "padding_y": "12px",
            "padding_x": "20px",
            "min_height": "44px"
          },
          "card": {
            "padding": "16px",
            "margin": "12px",
            "border_radius": "16px"
          },
          "input": {
            "padding_y": "12px",
            "padding_x": "14px",
            "height": "44px",
            "border_radius": "12px"
          }
        }
      },
      "components": {
        "buttons": {
          "primary": {
            "background": "linear-gradient(135deg, #1F5D4C 0%, #2E7D32 100%)",
            "text": "#FFFFFF",
            "border_radius": "12px",
            "padding": "12px 20px",
            "min_height": "44px",
            "font_weight": "600",
            "shadow": "0 2px 8px rgba(31, 93, 76, 0.25)",
            "hover": {
              "shadow": "0 4px 16px rgba(31, 93, 76, 0.35)",
              "transform": "translateY(-2px)"
            },
            "active": {
              "transform": "translateY(1px) scale(0.98)",
              "shadow": "0 1px 4px rgba(31, 93, 76, 0.3)"
            }
          },
          "secondary": {
            "background": "#FFFFFF",
            "border": "2px solid rgba(0,0,0,0.12)",
            "text": "#2C1810",
            "border_radius": "12px",
            "padding": "12px 20px",
            "min_height": "44px",
            "font_weight": "500",
            "hover": {
              "border_color": "#C65A2E",
              "shadow": "0 1px 3px rgba(0,0,0,0.1)"
            }
          },
          "ghost": {
            "background": "transparent",
            "text": "#1F5D4C",
            "border": "1px solid #1F5D4C",
            "border_radius": "12px",
            "padding": "12px 20px",
            "min_height": "44px"
          }
        },
        "cards": {
          "default": {
            "background": "#FFFFFF",
            "border": "1px solid rgba(0,0,0,0.12)",
            "border_radius": "16px",
            "shadow": "0 2px 8px rgba(0, 0, 0, 0.08)",
            "padding": "16px",
            "hover": {
              "shadow": "0 8px 24px rgba(0, 0, 0, 0.12)",
              "transform": "translateY(-4px)"
            }
          },
          "tasting": {
            "background": "linear-gradient(135deg, #FEF3E7 0%, #F7F3EA 100%)",
            "border": "1px solid rgba(31, 93, 76, 0.1)",
            "border_radius": "16px",
            "shadow": "0 2px 8px rgba(31, 93, 76, 0.08)",
            "hover": {
              "shadow": "0 8px 24px rgba(31, 93, 76, 0.15)",
              "transform": "translateY(-2px) scale(1.01)"
            }
          }
        },
        "forms": {
          "input": {
            "background": "#FFFFFF",
            "border": "2px solid rgba(0,0,0,0.12)",
            "border_radius": "12px",
            "padding": "12px 14px",
            "font_size": "16px",
            "min_height": "44px",
            "focus": {
              "border_color": "#C65A2E",
              "shadow": "0 0 0 3px rgb(212 175 55 / 10%)"
            }
          },
          "label": {
            "font_size": "14px",
            "font_weight": "500",
            "color": "#5C5C5C",
            "margin_bottom": "8px"
          }
        }
      },
      "effects": {
        "shadows": {
          "xs": "0 1px 2px rgba(0,0,0,0.05)",
          "sm": "0 1px 3px rgba(0,0,0,0.1)",
          "md": "0 4px 6px rgba(0,0,0,0.1)",
          "lg": "0 10px 15px rgba(0,0,0,0.15)",
          "xl": "0 20px 25px rgba(0,0,0,0.2)"
        },
        "gradients": {
          "primary": "linear-gradient(135deg, #1F5D4C 0%, #2E7D32 100%)",
          "accent": "linear-gradient(135deg, #C65A2E 0%, #D6743A 100%)",
          "subtle": "radial-gradient(90% 120% at 0% 0%, #FDF4E6 0%, #F7E9D6 60%, #F4E3CC 100%)"
        },
        "animations": {
          "fade_in_up": "translateY(20px) to translateY(0)",
          "scale_in": "scale(0.95) to scale(1)",
          "slide_in_left": "translateX(-20px) to translateX(0)",
          "slide_in_right": "translateX(20px) to translateX(0)"
        }
      },
      "responsive": {
        "breakpoints": {
          "mobile": "0px",
          "tablet": "640px",
          "desktop": "1024px",
          "wide": "1280px"
        },
        "containers": {
          "mobile": "calc(100vw - 32px)",
          "tablet": "calc(100vw - 48px)",
          "desktop": "min(1200px, calc(100vw - 64px))"
        }
      },
      "accessibility": {
        "contrast_minimum": "4.5:1 for normal text",
        "touch_targets": "≥44px minimum",
        "focus_ring": "2px solid #1F5D4C",
        "reduced_motion": "Respects prefers-reduced-motion",
        "color_blind_safe": true
      },
      "css_variables": {
        "colors": {
          "--primary": "#1F5D4C",
          "--primary-hover": "#2E7D32",
          "--secondary": "#D4AF37",
          "--accent": "#C65A2E",
          "--background": "#FEF3E7",
          "--surface": "#FFFFFF",
          "--text-primary": "#2C1810",
          "--text-secondary": "#5C5C5C",
          "--border": "rgba(0,0,0,0.12)"
        },
        "typography": {
          "--font-heading": "Crimson Text Variable, ui-serif, Georgia",
          "--font-body": "Inter Variable, system-ui, -apple-system, sans-serif",
          "--text-h1": "clamp(22px, 5vw, 28px)",
          "--text-body": "16px"
        },
        "spacing": {
          "--space-2": "8px",
          "--space-3": "12px",
          "--space-4": "16px",
          "--space-5": "20px"
        }
      },
      "tailwind_config": {
        "colors": {
          "primary": "var(--primary)",
          "secondary": "var(--secondary)",
          "accent": "var(--accent)",
          "background": "var(--background)",
          "surface": "var(--surface)",
          "text": {
            "primary": "var(--text-primary)",
            "secondary": "var(--text-secondary)"
          }
        },
        "fontFamily": {
          "heading": ["var(--font-heading)"],
          "body": ["var(--font-body)"]
        },
        "spacing": {
          "2": "var(--space-2)",
          "3": "var(--space-3)",
          "4": "var(--space-4)",
          "5": "var(--space-5)"
        }
      }
    },
    "requirements": {
      "file_structure": "Set up a Next.js project with TypeScript support. Include directories for pages, components, styles, and assets. Ensure the structure supports mobile-first development and is scalable for future features (e.g., Quick Tasting, Create Tasting). Example structure: /pages, /components, /styles, /public.",
      "landing_page": "Design a static landing page (/pages/index.tsx) reflecting the app's overview and unique value. Include a hero section with the app name, a brief tagline (e.g., 'Taste the World, One Sip at a Time'), and a call-to-action button (e.g., 'Get Started'). Use the CSS design system's colors, typography, and spacing for a Mexican-inspired look. Optimize for mobile screens with responsive layouts using the provided breakpoints.",
      "no_functionality": "The landing page should be static HTML/TSX with inline styles or a linked CSS module (e.g., styles/index.module.css) based on the design system. Avoid adding interactive elements like forms or navigation beyond the call-to-action.",
      "development_setup": "Configure package.json with Node.js dependencies (e.g., next, react, typescript, tailwindcss) and a start script for local development (e.g., 'next dev')."
    },
    "additional_notes": {
      "inspiration": "Use the Quick Tasting PDF snippet to inspire the landing page's focus on simplicity and on-the-fly tasting. Leverage the Create Tasting PDF to hint at future versatility (e.g., Study vs. Competition modes) in the tagline or subtext.",
      "accessibility": "Ensure the design is touch-friendly with large touch targets (≥44px) and high contrast for accessibility, per the CSS design system's guidelines."
    },
    "current_date": "2025-09-15",
    "current_time": "11:34 AM CST"
  }
}