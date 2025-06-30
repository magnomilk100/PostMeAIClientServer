# PostMeAI - Social Media Content Generation Platform

## Overview

PostMeAI is a full-stack web application that enables users to create and publish AI-generated social media content across multiple platforms. The application uses AI to generate personalized content based on user inputs and automatically formats it for different social media channels.

## System Architecture

The application follows a monorepo structure with separate client and server directories:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for monorepo structure
- **UI Library**: Comprehensive shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for API state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database Access**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with tsx for development mode

### Database Schema
The application uses five main database tables:
- **users**: User authentication and profile data
- **posts**: Core post configuration and metadata
- **generatedContent**: AI-generated titles, bodies, and images
- **publishedPosts**: Platform publishing tracking
- **templates**: Automated posting schedules and templates

### UI Components
Extensive component library including:
- Form controls (Input, Textarea, Select, Checkbox, RadioGroup)
- Navigation (Breadcrumb, Menu, Tabs)
- Feedback (Toast, Alert, Progress)
- Layout (Card, Sheet, Dialog, Popover)
- Data display (Table, Calendar, Chart)

## Data Flow

1. **Content Creation**: Users input subject matter and configuration options
2. **AI Generation**: System generates content based on user parameters
3. **Content Review**: Users can review and edit generated content
4. **Platform Optimization**: Content is adapted for different social platforms
5. **Publishing**: Content is published to selected social media platforms
6. **Template Creation**: Users can save configurations as reusable templates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **tailwindcss**: Utility-first CSS framework

### Platform Integrations
The application supports content generation for:
- Facebook
- Instagram 
- LinkedIn
- TikTok
- YouTube
- Discord
- Telegram

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Port**: 5000 (configurable via environment)
- **Hot Reload**: Enabled via Vite middleware
- **Database**: Requires `DATABASE_URL` environment variable

### Production Build
- **Build Command**: `npm run build`
- **Output**: Static files in `dist/public`, server bundle in `dist/index.js`
- **Start Command**: `npm run start`
- **Deployment Target**: Replit autoscale deployment

### Environment Configuration
- **Node Version**: 20.x
- **Database**: PostgreSQL 16
- **Modules**: nodejs-20, web, postgresql-16 (Replit configuration)

## Changelog

Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Enhanced UI components:
  - Added Lucide React icons to sidebar navigation
  - Improved Social Media page with API key management and visibility toggles
  - Enhanced Templates page with data table, mock templates, and execution modal
  - Added comprehensive template management functionality
- June 26, 2025. Major feature implementations:
  - Created comprehensive documentation page with complete feature overview
  - Fixed homepage button visibility with proper transparency 
  - Added beautiful pastel colors and icons throughout the application
  - Built complete image library with folder organization and upload functionality
  - Implemented manual post creation with image selection from library
  - Updated social media platforms with authentic brand colors and official styling
  - Updated user profile name to "Edmar Junior Forced Developer" with matching initials
- June 26, 2025. Homepage optimization and accordion implementation:
  - Removed salmon/rose background colors for cleaner white design
  - Added comprehensive "What is PostMeAI?" description section
  - Implemented accordion component for "For Content Creators" and "For Businesses" sections
  - Improved content organization with icons and bullet points
  - Enhanced visual flow and made more content visible at first glance
- June 26, 2025. Loading animations and authentication optimization:
  - Fixed infinite authentication loops that caused excessive API requests
  - Implemented comprehensive loading animations with spinning icons throughout application
  - Fixed Sign In/Get Started buttons to use client-side routing instead of page reloads
  - Added proper loading states to all form buttons (login, register, logout, AI post, manual post)
  - Optimized query client configuration to prevent unnecessary refetching
  - Fixed authentication redirects to use proper navigation without full page reloads
  - Eliminated blank white pages during navigation transitions
  - **CHECKPOINT: Loading animations working properly with optimized authentication system**
- June 27, 2025. Credits system and billing implementation:
  - Enhanced Create Your First Post button with dramatic purple hover effect (purple gradient background, white text)
  - Created comprehensive Privacy Policy page with professional legal content and header menu integration
  - Implemented credits/subscription system with user schema updates (credits, subscriptionPlan, subscriptionStatus)
  - Added credits display in header showing balance or "unlimited" for subscription users
  - Created Billing page with credit packages, transaction history, and payment integration mockups
  - Created Subscription Plan page with tiered pricing (Basic $29, Pro $79, Enterprise $199)
  - Reorganized sidebar navigation: separated business menus (Home, Post, Templates, Images, Social Media) from billing/admin menus (Billing, Subscription Plan, Settings, Documentation)
  - Added proper menu sections with separators and "Account & Billing" label
  - Logout button now separated as the final menu item
  - **CHECKPOINT: Complete billing system with reorganized navigation structure**
- June 27, 2025. Page explanations and comprehensive settings:
  - Added detailed explanatory content to Post, Templates, and Images pages describing features and benefits
  - Converted explanation sections to accordion components to save page space while keeping content accessible
  - Enhanced Settings page with 5 comprehensive tabs: Profile, Notifications, Theme, Company, and Security settings
  - Implemented collapsible help sections using accordion UI for better space management
  - All explanations include visual icons, feature benefits, and practical usage tips
  - **CHECKPOINT: Space-efficient page explanations with comprehensive user settings**
- June 27, 2025. Enhanced Social Media page with advanced platform management:
  - Replaced Font Awesome icons with proper React icons from react-icons/si for authentic platform branding
  - Added checkbox selection for each social media platform (all checked by default)
  - Implemented platform filtering: unchecked platforms won't be used for post generation
  - Replaced "Not connected" text with TEST buttons for API key validation
  - Added comprehensive connection status display with animated indicators
  - Implemented error logging system showing specific failure reasons below each platform
  - Added API key validation: empty keys show warning message before testing
  - Enhanced UI with status indicators: Testing, Connected, Failed, Ready to test
  - Added platform selection counter and informational help section
  - Improved UX by sorting platforms: selected ones appear first, unselected ones after
  - **CHECKPOINT: Complete social media platform management with testing functionality**
- June 27, 2025. Enhanced Settings with image upload functionality:
  - Added functional profile photo upload with file validation (5MB limit)
  - Added functional company logo upload with file validation (5MB limit)
  - Implemented image preview functionality with FileReader API
  - Added remove photo/logo buttons for better UX
  - Enhanced UI with better visual feedback and toast notifications
  - Images display in real-time after upload with proper sizing and styling
  - **CHECKPOINT: Complete image upload functionality for profile and company branding**
- June 27, 2025. AI-powered post creation with backend integration:
  - Added AI/Manual toggle switch for post creation mode selection
  - Implemented backend `/api/ai/generate-content` endpoint with smart content generation
  - Added 4-line multiline subject textarea for detailed topic descriptions
  - Created intelligent content generation based on subject keywords (business, tech, community, etc.)
  - Added collapsible accordion behavior: AI section collapses after successful content generation
  - Updated UI text: "You choose to use AI support for Title and Post content, describe your subject below"
  - Implemented visual indicators with purple badges for AI-generated content
  - Added edit capability: users can modify AI-generated content before publishing
  - Backend simulates realistic AI processing time with contextual responses
  - **CHECKPOINT: Complete AI-assisted post creation with automatic accordion collapse**
- June 27, 2025. Enhanced Images page with complete folder management:
  - Added dynamic folder selection dropdown for image uploads (Upload to: selector)
  - Fixed newly created folders to automatically appear in "Filter by folder" dropdown
  - Implemented proper folder state management with dynamic folder list updates
  - Added "uncategorized" folder support for images without specific folder assignment
  - Enhanced folder creation to immediately add folders to both upload and filter dropdowns
  - Improved user experience with clear folder assignment during upload process
  - **CHECKPOINT: Complete folder management system for image organization**
- June 27, 2025. Enhanced Manual Post image selection with folder browsing:
  - Implemented 5-image maximum limit with visual feedback and toast notifications
  - Added expandable folder browsing system with chevron indicators
  - Enhanced UI showing image counts per folder and selected images badges
  - Added disabled state for images when maximum limit is reached
  - Improved image selection counter showing "Selected Images (X/5)"
  - Created organized folder structure with clickable headers to expand/collapse
  - Added helpful tips section explaining image selection workflow
  - **CHECKPOINT: Complete image selection system with folder organization and limits**
- June 27, 2025. Manual Post success screen optimization:
  - Removed template save option from Manual Post success screen (only shows "Successfully Published")
  - Added proper social media brand icons to success screen using react-icons/si
  - Updated Manual Post flow to properly store data for success screen display
  - Conditionally hide template save section for manual posts (only show for AI posts)
  - Enhanced platform display with authentic brand icons (Facebook, Instagram, LinkedIn, etc.)
  - **CHECKPOINT: Clean success screen for manual posts with proper branding**
- June 27, 2025. Added Create New Post button to Success page:
  - Added prominent "Create New Post" button after the "Successfully Published" message
  - Button redirects users to the Post selection page (/post) to start creating another post
  - Improved user flow by providing easy path to create additional content
  - **CHECKPOINT: Enhanced success page with seamless post creation workflow**
- June 27, 2025. UI improvements and form validation fixes:
  - Moved "Create New Post" button to after the "Published Content Summary" section
  - Set all Target Platforms checkboxes to be checked by default on Manual Post creation
  - Fixed form validation to clear immediately when text is added (mode: "onChange")
  - Enhanced user experience with instant validation feedback for Title and Content fields
  - **CHECKPOINT: Improved form validation and default platform selection**
- June 27, 2025. Fixed platform checkboxes and AI validation issues:
  - Fixed Target Platforms checkboxes to display as checked by default in Manual Post creation
  - Added `checked` property to platform checkboxes connecting them to form values
  - Fixed validation messages to clear when AI generates content automatically
  - Added `form.trigger()` calls to refresh validation after AI content generation and platform changes
  - **CHECKPOINT: Complete platform selection and validation fixes**
- June 27, 2025. Created Watch Demo page with embedded YouTube videos:
  - Built comprehensive demo video gallery with 6 tutorial videos covering different aspects of PostMeAI
  - Implemented embedded YouTube player using VIVID DESIRE channel video as placeholder
  - Created responsive 3-column grid layout with video thumbnails, titles, and descriptions
  - Added modal dialog system for full-screen video viewing with autoplay
  - Connected "Watch Demo" button on homepage to navigate to new demo page
  - Included back navigation and additional CTA buttons for documentation and post creation
  - **CHECKPOINT: Complete demo video system with YouTube integration**
- June 27, 2025. Enhanced Images page with folder management and bulk operations:
  - Added "Move Images" functionality allowing users to relocate images between folders
  - Implemented bulk selection with checkboxes for multiple image operations
  - Created move mode UI with "Select All/Deselect All" and selection counter
  - Added visual feedback with blue highlighting for selected images
  - Built move dialog with target folder selection dropdown
  - Enabled both single and multi-image folder transfers with confirmation toasts
  - Enhanced UX with dedicated move mode controls and cancel functionality
  - **CHECKPOINT: Complete image folder management with bulk operations**
- June 27, 2025. Updated Watch Demo page with specific YouTube videos:
  - Replaced placeholder video IDs with unique VIVID DESIRE channel videos
  - Updated video IDs: QPIPGUGmtbk, iX3HrzEie00, a1XUJvsHLoE, zx4yH0wxQRI, zU1rl1Zr6gA
  - Each demo video now has distinct content and thumbnails from YouTube
  - Fixed video thumbnail URLs to use hqdefault.jpg format for better compatibility
  - **CHECKPOINT: Demo page with authentic YouTube video content**
- June 27, 2025. Sidebar navigation restructure with Learning & Help section:
  - Separated Documentation from Account & Billing section
  - Created new "Learning & Help" section with Video Demos and Documentation menus
  - Added Video Demos menu pointing to /watch-demo page (same as homepage "Watch Demo" button)
  - Reorganized sidebar with three distinct sections: Business tools, Account & Billing, Learning & Help
  - Enhanced navigation structure for better user experience and logical grouping
  - **CHECKPOINT: Complete sidebar navigation restructure with dedicated learning section**
- June 27, 2025. Comprehensive payment system implementation:
  - Added PaymentForm component with multi-gateway support (Stripe, PayPal, Payrexx, MangoPay)
  - Implemented payment gateway factory pattern with modular architecture
  - Created payment transaction database tables with full audit trail
  - Added payment processing routes with validation and error handling
  - Enhanced Billing page with real-time transaction history
  - Integrated credit card form with billing address and security features
  - Added payment method selection and validation
  - Implemented payment success/failure handling with user feedback
  - **CHECKPOINT: Complete payment system ready for gateway configuration**
- June 28, 2025. Execution mode workflow restructure and review system:
  - Removed "Execution Mode" field from AI Post and Content Generated pages for cleaner UX
  - Added "Execution Mode" dropdown to Success page template configuration section
  - Implemented conditional messaging based on execution mode selection:
    * Review mode: Warns posts need approval and references "Pendent Posts to be Reviewed" page
    * Auto mode: Warns content will publish immediately without human intervention
  - Created comprehensive "Pendent Posts to be Reviewed" page with full review functionality:
    * Shows posts awaiting approval with Review execution mode
    * Edit, approve, reject functionality for each post with toast notifications
    * Authentic platform icons using react-icons/si package
    * Scheduling details, template information, and creation timestamps
    * Modal dialog for editing post content before approval
  - Added "Pendent Posts" menu item to business navigation section with Clock icon
  - Enhanced execution mode workflow: AI post creation → success page template setup → pending review management
  - **CHECKPOINT: Complete execution mode restructure with pending review system**
- June 28, 2025. Images page database integration with binary data storage:
  - Added images table schema with binary data storage for .jpg/.png files
  - Implemented complete CRUD operations: insert, edit, delete, and folder management
  - Added base64 encoding/decoding for binary image storage in PostgreSQL
  - Created comprehensive API routes for image management with user authentication
  - Updated Images page to use React Query for real-time database operations
  - Added file validation (type and size limits) and proper error handling
  - Replaced mock localStorage with persistent database storage
  - Enhanced UI with loading states and database-driven folder management
  - **CHECKPOINT: Complete database integration for Images page with binary storage**
- June 29, 2025. Fixed React Query cache issues and confirmed user-specific data security:
  - Fixed React Query configuration to enable proper cache updates (refetchOnMount: true)
  - Implemented manual refetch strategy for immediate UI updates after mutations
  - Resolved folder creation and image upload UI refresh issues
  - Confirmed all API endpoints properly filter by user ID for data security:
    * Folders API: POST/GET/DELETE endpoints use req.user.id for user filtering
    * Images API: All CRUD operations include userId parameter for data isolation
    * Database storage methods: getFoldersByUserId, getImagesByUserId enforce user separation
  - Each user sees only their own folders and images with full database persistence
  - Server logs confirm successful image operations with proper user authentication
  - **CHECKPOINT ESTABLISHED: Complete Images page with secure user-specific data isolation**
- June 29, 2025. Social Media page database integration implementation:
  - Created socialMediaConfigs database table with user-specific platform configurations
  - Added comprehensive API endpoints for social media configuration management:
    * GET /api/social-media-configs - Fetch user's platform configurations
    * POST /api/social-media-configs - Save/update platform configurations 
    * POST /api/social-media-configs/:platformId/test - Test API connection with persistence
  - Implemented complete database storage methods with user filtering and upsert functionality
  - Updated Social Media page to use React Query for database integration
  - Added persistent test status tracking - connection results saved to database and displayed on page load
  - Enhanced UI with proper loading states for saving configurations and testing connections
  - Maintained existing layout, checkboxes, and functionalities while adding database persistence
  - All social media data now user-specific with complete data isolation and persistence
  - **CHECKPOINT: Complete Social Media page database integration with persistent configurations**
- June 29, 2025. Enhanced Billing page with full database integration:
  - Fixed API key field clearing issue in Social Media page - fields now preserve user input during save
  - Fixed image display issue in Manual Post page - selected images now show actual content using base64 data
  - Enhanced Billing page with complete database integration while preserving existing functionality:
    * Current Balance loads from database via user.credits with real-time updates
    * Credit purchases (packages and custom amounts) save to database with full transaction records
    * Transaction history dynamically loads from database showing payment method, date, credits, amount, status
    * Enhanced payment success handler to refresh user credits and transaction history
    * All billing data is user-specific with secure data isolation
    * Maintained existing UI structure, credit packages, and payment form integration
  - **CHECKPOINT: Complete Billing page database integration with persistent user-specific financial data**
- June 29, 2025. Full Subscription Plan page functionality implementation:
  - Added comprehensive database integration with subscription management API endpoints:
    * POST /api/subscription/upgrade - Handles plan upgrades with validation and transaction recording
    * POST /api/subscription/cancel - Manages subscription cancellations with status updates
  - Enhanced storage interface with subscription operations: updateUserSubscription, cancelUserSubscription
  - Implemented visual hover effects: dramatic scaling, shadow enhancement, and ring animations on plan cards
  - Added React Query mutations for subscription upgrade and cancellation with loading states
  - Created confirmation dialogs with detailed plan information and cancellation warnings
  - Built subscription logic ensuring only one active plan per user with proper status management
  - Added real-time UI updates: current plan highlighting, disabled states, and loading animations
  - Integrated payment transaction recording for subscription changes with audit trail
  - Enhanced user experience with toast notifications and error handling
  - All subscription data is user-specific with secure data isolation and database persistence
  - **CHECKPOINT: Complete Subscription Plan page with full database integration and visual enhancements**
- June 29, 2025. Complete Settings page implementation with full database integration:
  - Implemented comprehensive Settings page with 5 fully functional tabs: Profile, Notifications, Theme, Company, Security
  - Added profile photo upload and company logo upload functionality with proper file validation (5MB limits)
  - Created real-time image preview using FileReader API with remove photo/logo buttons
  - Enhanced all save buttons with loading animations and disabled states during database operations
  - Integrated all settings tabs with PostgreSQL database through dedicated API endpoints:
    * POST /api/settings/profile - Profile information, bio, timezone, language, photo upload
    * POST /api/settings/notifications - Email, push, reminder, and marketing email preferences
    * POST /api/settings/theme - Light/dark mode, colors, layout, and UI preferences
    * POST /api/settings/company - Company name, logo, website, industry, team size, brand colors
    * POST /api/settings/security - Session timeout, auto-save, login preferences, 2FA settings
  - All settings data persists to database and loads on page refresh with user-specific data isolation
  - Added comprehensive form validation with real-time feedback and toast notifications
  - **CHECKPOINT: Complete Settings page with full database integration and file upload capabilities**
- June 29, 2025. Manual Post workflow fixes and platform-content page improvements:
  - Fixed Manual Post API response parsing in platform-content page to properly handle { post, generatedContent } structure
  - Updated publish endpoint to include isManualPost flag based on post.executionMode === "manual"
  - Enhanced Success page conditional logic to hide template scheduling section for manual posts
  - Verified complete Manual Post workflow: Create → Platform Content → Publish → Success (no template option)
  - Fixed platform-content page data loading from localStorage with proper structure parsing
  - **CHECKPOINT: Complete Manual Post workflow with proper content display and conditional UI behavior**
- June 29, 2025. Complete Templates page implementation with full database integration:
  - Added comprehensive Templates page with table display showing Name, Objective, Date Creation, Last Execution, Status, and Actions
  - Implemented complete backend API endpoints for template management:
    * GET /api/templates - Fetch user templates with enhanced data (objective from post subject)
    * GET /api/templates/:id - Fetch individual template with associated post and content data
    * PUT /api/templates/:id - Update template properties with user verification
    * DELETE /api/templates/:id - Delete template with confirmation and user verification
    * POST /api/templates/:id/execute - Execute template and update last execution timestamp
  - Enhanced database schema with lastExecutedAt field for execution tracking
  - Added comprehensive storage methods: getTemplateById, updateTemplate, deleteTemplate, executeTemplate
  - Created full CRUD operations with proper user-specific data filtering and authentication
  - Implemented template actions with loading states and toast notifications:
    * Run Now button triggers template execution with backend integration
    * Edit button navigates to AI post editor with template data pre-filled
    * Delete button shows confirmation dialog before database removal
  - Added "Create New Template" flow redirecting to ai-post page with title override "AI Automated Post – Template Creation"
  - Enhanced AI Post page to handle template creation mode and template editing with URL parameters
  - Added comprehensive loading animations, error handling, and user feedback throughout workflow
  - All template data properly filtered by user ID with secure database isolation
  - **CHECKPOINT: Complete Templates page with full database integration, CRUD operations, and secure user-specific functionality**

## User Preferences

Preferred communication style: Simple, everyday language.