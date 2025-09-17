
  
  
  "mobile_first_design_system": {
    "overview": {
      "description": "Comprehensive mobile-first design system for FlavorWheel application",
      "target_viewport": "375x667px (iPhone SE) minimum",
      "design_philosophy": "Clean, accessible, touch-friendly interface with consistent visual hierarchy"
    },
    
    "color_palette": {
      "primary": {
        "50": "#fef7ee",
        "100": "#fdedd3",
        "200": "#fbd7a5",
        "300": "#f8bc6d",
        "400": "#f59e0b",
        "500": "#d97706",
        "600": "#b45309",
        "700": "#92400e",
        "800": "#78350f",
        "900": "#451a03"
      },
      "secondary": {
        "50": "#f0f9ff",
        "100": "#e0f2fe",
        "200": "#bae6fd",
        "300": "#7dd3fc",
        "400": "#38bdf8",
        "500": "#0ea5e9",
        "600": "#0284c7",
        "700": "#0369a1",
        "800": "#075985",
        "900": "#0c4a6e"
      },
      "neutral": {
        "50": "#fafafa",
        "100": "#f5f5f5",
        "200": "#e5e5e5",
        "300": "#d4d4d4",
        "400": "#a3a3a3",
        "500": "#737373",
        "600": "#525252",
        "700": "#404040",
        "800": "#262626",
        "900": "#171717"
      },
      "semantic": {
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
        "info": "#3b82f6"
      }
    },
    
    "typography": {
      "font_families": {
        "primary": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "secondary": "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        "mono": "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace"
      },
      "scale": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      "weights": {
        "light": 300,
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "line_heights": {
        "tight": 1.25,
        "normal": 1.5,
        "relaxed": 1.625
      }
    },
    
    "spacing_system": {
      "base_unit": "4px",
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
        "16": "64px",
        "20": "80px"
      }
    },
    
    "component_specifications": {
      "buttons": {
        "primary": {
          "background": "primary-500",
          "text": "white",
          "padding": "12px 24px",
          "border_radius": "8px",
          "font_weight": "medium",
          "min_height": "44px",
          "touch_target": "44x44px minimum"
        },
        "secondary": {
          "background": "transparent",
          "text": "primary-600",
          "border": "1px solid primary-300",
          "padding": "12px 24px",
          "border_radius": "8px",
          "min_height": "44px"
        }
      },
      "inputs": {
        "text_field": {
          "background": "neutral-50",
          "border": "1px solid neutral-300",
          "border_radius": "8px",
          "padding": "12px 16px",
          "font_size": "16px",
          "min_height": "44px",
          "focus_border": "primary-500"
        },
        "textarea": {
          "background": "neutral-50",
          "border": "1px solid neutral-300",
          "border_radius": "8px",
          "padding": "12px 16px",
          "font_size": "16px",
          "min_height": "88px",
          "resize": "vertical"
        }
      },
      "cards": {
        "default": {
          "background": "white",
          "border_radius": "12px",
          "shadow": "0 1px 3px rgba(0,0,0,0.1)",
          "padding": "16px",
          "border": "1px solid neutral-200"
        }
      }
    },
    
    "mobile_optimization_guidelines": {
      "viewport_management": {
        "meta_viewport": "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        "container_max_width": "100vw",
        "horizontal_padding": "16px",
        "prevent_horizontal_scroll": "overflow-x: hidden on body and html"
      },
      "touch_targets": {
        "minimum_size": "44x44px",
        "spacing_between": "8px minimum",
        "thumb_zone": "Bottom 1/3 of screen for primary actions"
      },
      "content_strategy": {
        "single_column_layout": "Always use single column on mobile",
        "progressive_disclosure": "Show essential info first, details on demand",
        "thumb_friendly_navigation": "Bottom navigation for primary actions"
      }
    },
    
    "overflow_fixes": {
      "global_styles": {
        "html_body": "overflow-x: hidden; max-width: 100vw;",
        "container_classes": "max-w-full overflow-hidden",
        "image_responsive": "max-width: 100%; height: auto;"
      },
      "common_issues": {
        "wide_content": "Use 'w-full max-w-full' classes",
        "fixed_widths": "Replace with responsive units (%, vw, rem)",
        "long_text": "word-wrap: break-word; overflow-wrap: break-word;",
        "tables": "overflow-x: auto; on container with min-width"
      }
    },
    
    "implementation_strategy": {
      "css_custom_properties": {
        "location": "styles/design-tokens.css",
        "naming_convention": "--color-primary-500, --spacing-4, --font-size-lg",
        "dark_mode_support": "CSS custom properties with media queries"
      },
      "tailwind_config": {
        "extend_theme": "Add custom colors, fonts, and spacing to tailwind.config.js",
        "component_classes": "Create utility classes for common patterns",
        "responsive_breakpoints": "sm: 640px, md: 768px, lg: 1024px, xl: 1280px"
      },
      "component_library": {
       "base_components": "Button, Input, Card, Modal, Toast",
       "composition_pattern": "Build complex components from base components",
       "accessibility": "ARIA labels, keyboard navigation, screen reader support"
     },
     
     "icon_system": {
       "library": "Lucide React",
       "package": "lucide-react",
       "usage_policy": "Use Lucide icons exclusively - NO emojis allowed",
       "installation": "npm install lucide-react",
       "import_pattern": "import { IconName } from 'lucide-react'",
       "sizing": {
         "small": "16px",
         "medium": "20px",
         "large": "24px",
         "xl": "32px"
       },
       "color_inheritance": "Icons should inherit text color by default",
       "common_icons": {
         "navigation": "ChevronLeft, ChevronRight, Menu, X, Home, User",
         "actions": "Plus, Minus, Edit, Trash2, Save, Download, Upload",
         "status": "Check, AlertCircle, Info, XCircle, CheckCircle",
         "media": "Camera, Image, Play, Pause, Volume2",
         "social": "Heart, Share, MessageCircle, Star"
       }
     }
    },
    
    "migration_plan": {
      "phase_1": {
        "title": "Foundation Setup",
        "tasks": [
          "Update design-tokens.css with new color palette",
          "Configure Tailwind with custom theme",
          "Add global overflow fixes to globals.css",
          "Update viewport meta tag"
        ]
      },
      "phase_2": {
        "title": "Component Updates",
        "tasks": [
          "Refactor buttons to use new design system",
          "Update form inputs with proper sizing",
          "Fix card components with consistent styling",
          "Ensure all touch targets meet 44px minimum"
        ]
      },
      "phase_3": {
        "title": "Layout Optimization",
        "tasks": [
          "Convert multi-column layouts to single column on mobile",
          "Implement responsive image handling",
          "Add proper text wrapping for long content",
          "Test and fix any remaining overflow issues"
        ]
      },
      "phase_4": {
        "title": "Testing and Refinement",
        "tasks": [
          "Test on various mobile devices and screen sizes",
          "Validate accessibility compliance",
          "Performance optimization",
          "User testing and feedback incorporation"
        ]
      }
    }
  }
