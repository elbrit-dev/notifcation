import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import dynamic from "next/dynamic";

// Use Next dynamic imports to lazy-load all heavy/optional components.
// Disable SSR for client-only widgets to avoid server work.
const MicrosoftSSOLogin = dynamic(() => import("./components/MicrosoftSSOLogin"), { ssr: false, loading: () => null });
const TruecallerSSOLogin = dynamic(() => import("./components/TruecallerSSOLogin"), { ssr: false, loading: () => null });
const PlasmicDataContext = dynamic(() => import("./components/PlasmicDataContext"), { ssr: false, loading: () => null });
const PrimeDataTable = dynamic(() => import("./components/PrimeDataTable"), { ssr: false, loading: () => null });
const SimpleDataTable = dynamic(() => import("./components/SimpleDataTable"), { ssr: false, loading: () => null });
const ExportDataButton = dynamic(() => import("./components/ExportDataButton"), { ssr: false, loading: () => null });
const FileImportButton = dynamic(() => import("./components/FileImportButton"), { ssr: false, loading: () => null });
// const PrimeDataTableOptimized = dynamic(() => import("./components/PrimeDataTableOptimized"), { ssr: false, loading: () => null });
const FirestoreDebug = dynamic(() => import("./components/FirestoreDebug"), { ssr: false, loading: () => null });
const EnvironmentCheck = dynamic(() => import("./components/EnvironmentCheck"), { ssr: false, loading: () => null });
const PrimeDataTab = dynamic(() => import("./components/pimereact"), { ssr: false, loading: () => null });
const LinkComponent = dynamic(() => import("./components/LinkComponent"), { ssr: false, loading: () => null });
const TagFilterPrimeReact = dynamic(() => import("./components/TagFilterPrimeReact"), { ssr: false, loading: () => null });
const PrimeTimeline = dynamic(() => import("./components/PrimeTimeline"), { ssr: false, loading: () => null });
const SimpleButton = dynamic(() => import("./components/SimpleButton"), { ssr: false, loading: () => null });
const SimpleCard = dynamic(() => import("./components/SimpleCard"), { ssr: false, loading: () => null });
const PrintButton = dynamic(() => import("./components/PrintButton"), { ssr: false, loading: () => null });
const PrintWrapper = dynamic(() => import("./components/PrintWrapper"), { ssr: false, loading: () => null });
const AdvancedSkeleton = dynamic(() => import("./components/AdvancedSkeleton"), { ssr: false, loading: () => null });
const StaticSkeleton = dynamic(() => import("./components/StaticSkeleton"), { ssr: false, loading: () => null });
const RectSkeleton = dynamic(() => import("./components/RectSkeleton"), { ssr: false, loading: () => null });
const CircleSkeleton = dynamic(() => import("./components/CircleSkeleton"), { ssr: false, loading: () => null });
const RavenChatEmbed = dynamic(() => import("./components/RavenChatEmbed"), { ssr: false, loading: () => null });
const NovuInbox = dynamic(() => import("./components/NovuInbox"), { ssr: false, loading: () => null });
const ClientOnly = dynamic(() => import("./components/PlasmicPerformance").then(m => m.ClientOnly), { ssr: false, loading: () => null });
const VisibilityGate = dynamic(() => import("./components/PlasmicPerformance").then(m => m.VisibilityGate), { ssr: false, loading: () => null });


export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'oiawYdGgGKrh1ZZAv15gDZ',  // ID of a project you are using
      token: 'at5jesnXc89u9hbeOAv8HEZRXhbDHtJCVKm7DsJoRGxuRCGXsNP4LynYxAea6cDCjlePUmjN5TIX3ImE35A',  // API token for that project
      version: process.env.PLASMIC_VERSION_TAG  // Version tag (e.g., 'prod', 'dev')
    }
  ],

  // Fetches latest revisions. Disable in production to render only published changes.
  preview: process.env.NODE_ENV !== 'production',
  
  // Disable Plasmic's built-in authentication system
  // This allows our custom authentication to work without interference
  auth: {
    // Disable Plasmic's built-in auth
    enabled: false,
    // Provide a custom auth handler that always returns authenticated
    getUserAndToken: async () => {
      // Return null to indicate no Plasmic auth is needed
      // Our custom auth will handle everything
      return null;
    }
  }
});

PLASMIC.registerComponent(MicrosoftSSOLogin, {
  name: "MicrosoftSSOLogin",
  displayName: "Microsoft SSO Login",
  description: "Microsoft SSO login component using FirebaseUI",
  props: {
    onSuccess: {
      type: "eventHandler",
      argTypes: [
        {
          name: "firebaseUser",
          type: "object"
        }
      ]
    },
    onError: {
      type: "eventHandler",
      argTypes: [
        {
          name: "error",
          type: "object"
        }
      ]
    }
  },
  importPath: "./components/MicrosoftSSOLogin"
});

PLASMIC.registerComponent(TruecallerSSOLogin, {
  name: "TruecallerSSOLogin",
  displayName: "Truecaller SSO Login",
  description: "Truecaller deep-link login with backend polling",
  props: {
    apiUrl: {
      type: "string",
      description: "Base backend URL exposing /api/method/truecaller",
      defaultValue: "https://uat.elbrit.org"
    },
    partnerKey: {
      type: "string",
      description: "Truecaller partner key",
      defaultValue: ""
    },
    partnerName: { type: "string", defaultValue: "App" },
    privacyUrl: { type: "string", defaultValue: "https://yourdomain.com/privacy" },
    termsUrl: { type: "string", defaultValue: "https://yourdomain.com/terms" },
    ttl: { type: "number", defaultValue: 60000 },
    lang: { type: "string", defaultValue: "en" },
    loginPrefix: { type: "string", defaultValue: "getstarted" },
    loginSuffix: { type: "string", defaultValue: "register" },
    ctaPrefix: { type: "string", defaultValue: "use" },
    ctaColor: { type: "string", defaultValue: "#f75d34" },
    ctaTextColor: { type: "string", defaultValue: "#ffffff" },
    btnShape: { type: "choice", options: ["round", "square"], defaultValue: "round" },
    skipOption: { type: "string", defaultValue: "useanothernum" },
    buttonText: { type: "string", defaultValue: "Truecaller" },
    showDebug: { type: "boolean", defaultValue: false },
    showStatus: { type: "boolean", defaultValue: true },
    showRequestId: { type: "boolean", defaultValue: false },
    fullWidth: { type: "boolean", defaultValue: false },
    enableAuthIntegration: { type: "boolean", defaultValue: false, description: "Store session/user and write to Firestore/ERPNext" },
    redirectOnSuccess: { type: "boolean", defaultValue: true, description: "Navigate after successful verification" },
    redirectPath: { type: "string", defaultValue: "/", description: "Path to navigate to on success" },
    className: { type: "string", defaultValue: "" },
    onSuccess: {
      type: "eventHandler",
      argTypes: [ { name: "response", type: "object" } ]
    },
    onError: {
      type: "eventHandler",
      argTypes: [ { name: "error", type: "object" } ]
    },
    onFailure: {
      type: "eventHandler",
      argTypes: [ { name: "error", type: "object" } ]
    }
  },
  importPath: "./components/TruecallerSSOLogin"
});

// Register the Plasmic Data Context component
PLASMIC.registerComponent(PlasmicDataContext, {
  name: "PlasmicDataContext",
  displayName: "Plasmic Data Context",
  description: "Provides user data context for Plasmic Studio data queries",
  props: {},
  importPath: "./components/PlasmicDataContext"
});

// Register the Firestore Debug component
PLASMIC.registerComponent(FirestoreDebug, {
  name: "FirestoreDebug",
  displayName: "Firestore Debug Panel",
  description: "Debug component to test Firestore connectivity and user creation",
  props: {},
  importPath: "./components/FirestoreDebug"
});

// Register the Environment Check component
PLASMIC.registerComponent(EnvironmentCheck, {
  name: "EnvironmentCheck",
  displayName: "Environment Variables Check",
  description: "Check if all required environment variables are set",
  props: {},
  importPath: "./components/EnvironmentCheck"
});

// Performance helper wrappers for Studio
PLASMIC.registerComponent(ClientOnly, {
  name: "ClientOnly",
  displayName: "Client Only",
  description: "Render children only on the client (after optional delay)",
  props: {
    children: { type: "slot" },
    fallback: { type: "slot", defaultValue: "" },
    delayMs: { type: "number", defaultValue: 0 }
  },
  importPath: "./components/PlasmicPerformance"
});

PLASMIC.registerComponent(VisibilityGate, {
  name: "VisibilityGate",
  displayName: "Visibility Gate",
  description: "Defer rendering until the element is near the viewport.",
  props: {
    children: { type: "slot" },
    rootMargin: { type: "string", defaultValue: "200px 0px" },
    minHeight: { type: "string", defaultValue: "240px" },
    delayMs: { type: "number", defaultValue: 0 },
    placeholderClassName: { type: "string", defaultValue: "" },
    placeholderStyle: { type: "object", defaultValue: {} }
  },
  importPath: "./components/PlasmicPerformance"
});

// Register the Link Component
PLASMIC.registerComponent(LinkComponent, {
  name: "LinkComponent",
  displayName: "Link Component",
  description: "A wrapper component for Next.js Link with instant navigation - no page refresh",
  props: {
    href: {
      type: "string",
      description: "The URL to navigate to",
      required: true,
      defaultValue: "/"
    },
    children: {
      type: "slot",
      description: "Content to render inside the link"
    },
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    target: {
      type: "choice",
      options: ["_self", "_blank", "_parent", "_top"],
      description: "Link target attribute",
      defaultValue: "_self"
    },
    rel: {
      type: "string",
      description: "Link rel attribute",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the component"
    },
    replace: {
      type: "boolean",
      description: "Use replace instead of push for navigation",
      defaultValue: false
    },
    scroll: {
      type: "boolean",
      description: "Enable smooth scrolling to top",
      defaultValue: true
    },
    shallow: {
      type: "boolean",
      description: "Enable shallow routing for dynamic routes",
      defaultValue: false
    },
    prefetch: {
      type: "boolean",
      description: "Prefetch pages for faster navigation",
      defaultValue: true
    }
  },
  importPath: "./components/LinkComponent"
})

// Removed AdvancedTable (unused)
/* PLASMIC.registerComponent(AdvancedTable, {
  name: "AdvancedTable",
  displayName: "Advanced Data Table",
  description: "A comprehensive data table component with advanced features including search, filtering, sorting, pagination, row selection, and export capabilities",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "Array of data objects to display in the table",
      defaultValue: []
    },
    columns: {
      type: "object",
      description: "Array of column definitions with key, title, sortable, filterable, type, etc.",
      defaultValue: []
    },
    loading: {
      type: "boolean",
      description: "Whether the table is in loading state",
      defaultValue: false
    },
    error: {
      type: "string",
      description: "Error message to display",
      defaultValue: null
    },
    
    // GraphQL props
    graphqlQuery: {
      type: "string",
      description: "GraphQL query string to fetch data",
      defaultValue: null
    },
    graphqlVariables: {
      type: "object",
      description: "Variables for the GraphQL query",
      defaultValue: {}
    },
    refetchInterval: {
      type: "number",
      description: "Interval in milliseconds to refetch GraphQL data (0 = disabled)",
      defaultValue: 0
    },
    
    // Table configuration
    enableSearch: {
      type: "boolean",
      description: "Enable global search functionality",
      defaultValue: true
    },

    // Performance: defer heavy table until visible
    deferRenderUntilVisible: {
      type: "boolean",
      description: "Do not render the table until it scrolls into view",
      defaultValue: true
    },
    deferHydrationMs: {
      type: "number",
      description: "Additional delay (ms) after visibility before mounting",
      defaultValue: 0
    },
    minPlaceholderHeight: {
      type: "string",
      description: "Min height for the placeholder before table mounts",
      defaultValue: "320px"
    },
    enableColumnFilter: {
      type: "boolean",
      description: "Enable column-specific filtering",
      defaultValue: true
    },
    enableSorting: {
      type: "boolean",
      description: "Enable column sorting",
      defaultValue: true
    },
    enablePagination: {
      type: "boolean",
      description: "Enable pagination controls",
      defaultValue: true
    },
    enableRowSelection: {
      type: "boolean",
      description: "Enable row selection with checkboxes",
      defaultValue: false
    },
    enableExport: {
      type: "boolean",
      description: "Enable CSV export functionality",
      defaultValue: true
    },
    enableRefresh: {
      type: "boolean",
      description: "Enable manual refresh button",
      defaultValue: false
    },
    enableColumnManagement: {
      type: "boolean",
      description: "Enable column visibility management",
      defaultValue: true
    },
    enableBulkActions: {
      type: "boolean",
      description: "Enable bulk actions for selected rows",
      defaultValue: false
    },
    
    // Pagination
    pageSize: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    currentPage: {
      type: "number",
      description: "Current page number",
      defaultValue: 1
    },
    pageSizeOptions: {
      type: "object",
      description: "Array of page size options",
      defaultValue: [5, 10, 25, 50, 100]
    },
    
    // Styling
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    },
    tableHeight: {
      type: "string",
      description: "Height of the table container",
      defaultValue: "600px"
    },
    theme: {
      type: "choice",
      options: ["default", "dark", "minimal"],
      description: "Theme for the table styling",
      defaultValue: "default"
    },
    
    // Cell styling props
    cellWidth: {
      type: "string",
      description: "Width of table cells (auto, fixed, or specific value like '150px')",
      defaultValue: "auto"
    },
    cellHeight: {
      type: "string",
      description: "Height of table cells (auto, fixed, or specific value like '50px')",
      defaultValue: "auto"
    },
    cellMinWidth: {
      type: "string",
      description: "Minimum width of table cells (auto or specific value like '100px')",
      defaultValue: "auto"
    },
    cellMinHeight: {
      type: "string",
      description: "Minimum height of table cells (auto or specific value like '40px')",
      defaultValue: "auto"
    },
    cellMaxWidth: {
      type: "string",
      description: "Maximum width of table cells (none or specific value like '300px')",
      defaultValue: "none"
    },
    cellMaxHeight: {
      type: "string",
      description: "Maximum height of table cells (none or specific value like '100px')",
      defaultValue: "none"
    },
    
    // Default styling props
    defaultHeaderStyle: {
      type: "object",
      description: "Default header styling for auto-generated columns",
      defaultValue: {}
    },
    defaultBodyStyle: {
      type: "object",
      description: "Default body styling for auto-generated columns",
      defaultValue: {}
    },
    
    // Column grouping props
    enableColumnGrouping: {
      type: "boolean",
      description: "Enable column grouping functionality",
      defaultValue: false
    },
    headerColumnGroup: {
      type: "object",
      description: "Custom header column group component",
      defaultValue: null
    },
    footerColumnGroup: {
      type: "object",
      description: "Custom footer column group component",
      defaultValue: null
    },
    columnGroups: {
      type: "object",
      description: "Array of column group configurations",
      defaultValue: []
    },
    groupConfig: {
      type: "object",
      description: "Configuration for column grouping styling and behavior",
      defaultValue: {
        enableHeaderGroups: true,
        enableFooterGroups: true,
        groupStyle: {},
        headerGroupStyle: {},
        footerGroupStyle: {}
      }
    },
    
    // Event handlers
    onRowClick: {
      type: "eventHandler",
      description: "Called when a row is clicked",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The clicked row data"
        },
        {
          name: "index",
          type: "number",
          description: "The row index"
        }
      ]
    },
    onRowSelect: {
      type: "eventHandler",
      description: "Called when row selection changes",
      argTypes: [
        {
          name: "rowId",
          type: "string",
          description: "The row ID"
        },
        {
          name: "checked",
          type: "boolean",
          description: "Whether the row is selected"
        }
      ]
    },
    onExport: {
      type: "eventHandler",
      description: "Called when export is triggered",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The data being exported"
        }
      ]
    },
    onRefresh: {
      type: "eventHandler",
      description: "Called when refresh is triggered",
      argTypes: []
    },
    onPageChange: {
      type: "eventHandler",
      description: "Called when page changes",
      argTypes: [
        {
          name: "page",
          type: "number",
          description: "The new page number"
        }
      ]
    },
    onFilterChange: {
      type: "eventHandler",
      description: "Called when filters change",
      argTypes: [
        {
          name: "column",
          type: "string",
          description: "The column being filtered"
        },
        {
          name: "filterConfig",
          type: "object",
          description: "The filter configuration"
        }
      ]
    },
    onSortChange: {
      type: "eventHandler",
      description: "Called when sorting changes",
      argTypes: [
        {
          name: "columnKey",
          type: "string",
          description: "The column being sorted"
        },
        {
          name: "direction",
          type: "string",
          description: "The sort direction (asc/desc)"
        }
      ]
    },
    onSearch: {
      type: "eventHandler",
      description: "Called when search term changes",
      argTypes: [
        {
          name: "searchTerm",
          type: "string",
          description: "The search term"
        }
      ]
    },
    onBulkAction: {
      type: "eventHandler",
      description: "Called when bulk action is triggered",
      argTypes: [
        {
          name: "action",
          type: "object",
          description: "The bulk action configuration"
        },
        {
          name: "selectedRows",
          type: "object",
          description: "Array of selected row IDs"
        }
      ]
    },
    onGraphqlData: {
      type: "eventHandler",
      description: "Called when GraphQL data is received",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The GraphQL response data"
        }
      ]
    },
    
    // Action buttons
    rowActions: {
      type: "object",
      description: "Array of action buttons for each row",
      defaultValue: []
    },
    bulkActions: {
      type: "object",
      description: "Array of bulk action buttons",
      defaultValue: []
    },
    enableRowActions: {
      type: "boolean",
      description: "Enable row action buttons",
      defaultValue: false
    },
    fields: {
      type: "object",
      description: "Array of field keys to display as columns in the table. If empty, all fields are shown.",
      defaultValue: []
    },
    imageFields: {
      type: "object",
      description: "Array of field keys to render as images.",
      defaultValue: []
    },
    popupImageFields: {
      type: "object",
      description: "Array of image field keys that should open a popup modal when clicked.",
      defaultValue: []
    }
  },
  
  importPath: "./components/AdvancedTable"
}); */

// Register the PrimeReact Data Table component
PLASMIC.registerComponent(PrimeDataTable, {
  name: "PrimeDataTable",
  displayName: "PrimeReact Data Table",
  description: "A comprehensive data table component built with PrimeReact DataTable, featuring advanced search, filtering, sorting, pagination, row selection, export capabilities, and native mobile responsive layouts",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "Array of data objects to display in the table",
      defaultValue: []
    },
    columns: {
      type: "object",
      description: "Array of column definitions with key, title, sortable, filterable, type, editable, editor (React component), responsivePriority (1-5, for responsive column hiding), etc.",
      defaultValue: []
    },
    loading: {
      type: "boolean",
      description: "Whether the table is in loading state",
      defaultValue: false
    },
    error: {
      type: "string",
      description: "Error message to display",
      defaultValue: null
    },
    
    // GraphQL props
    graphqlQuery: {
      type: "string",
      description: "GraphQL query string to fetch data",
      defaultValue: null
    },
    graphqlVariables: {
      type: "object",
      description: "Variables for the GraphQL query",
      defaultValue: {}
    },
    refetchInterval: {
      type: "number",
      description: "Interval in milliseconds to refetch GraphQL data (0 = disabled)",
      defaultValue: 0
    },
    
    // Table configuration
    enableSearch: {
      type: "boolean",
      description: "Enable global search functionality",
      defaultValue: true
    },
    enableColumnFilter: {
      type: "boolean",
      description: "Enable column-specific filtering",
      defaultValue: true
    },
    enableSorting: {
      type: "boolean",
      description: "Enable column sorting",
      defaultValue: true
    },
    enablePagination: {
      type: "boolean",
      description: "Enable pagination controls",
      defaultValue: true
    },
    enableRowSelection: {
      type: "boolean",
      description: "Enable row selection with checkboxes",
      defaultValue: false
    },
    enableExport: {
      type: "boolean",
      description: "Enable CSV export functionality",
      defaultValue: true
    },
    enableRefresh: {
      type: "boolean",
      description: "Enable manual refresh button",
      defaultValue: false
    },
    enableColumnManagement: {
      type: "boolean",
      description: "Enable column visibility management",
      defaultValue: true
    },
    enableBulkActions: {
      type: "boolean",
      description: "Enable bulk actions for selected rows",
      defaultValue: false
    },
    
    // Pagination
    pageSize: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    currentPage: {
      type: "number",
      description: "Current page number",
      defaultValue: 1
    },
    pageSizeOptions: {
      type: "object",
      description: "Array of page size options",
      defaultValue: [5, 10, 25, 50, 100]
    },
    
    // Styling
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    },


    
    // Event handlers
    onRowClick: {
      type: "eventHandler",
      description: "Called when a row is clicked",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The clicked row data"
        },
        {
          name: "index",
          type: "number",
          description: "The row index"
        }
      ]
    },
    onRowSelect: {
      type: "eventHandler",
      description: "Called when row selection changes",
      argTypes: [
        {
          name: "selectedRows",
          type: "object",
          description: "Array of selected row data"
        }
      ]
    },
    onExport: {
      type: "eventHandler",
      description: "Called when export is triggered",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The data being exported"
        }
      ]
    },
    onRefresh: {
      type: "eventHandler",
      description: "Called when refresh is triggered",
      argTypes: []
    },
    onPageChange: {
      type: "eventHandler",
      description: "Called when page changes",
      argTypes: [
        {
          name: "page",
          type: "number",
          description: "The new page number"
        }
      ]
    },
    onFilterChange: {
      type: "eventHandler",
      description: "Called when filters change",
      argTypes: [
        {
          name: "filters",
          type: "object",
          description: "The current filters state"
        }
      ]
    },
    onSortChange: {
      type: "eventHandler",
      description: "Called when sorting changes",
      argTypes: [
        {
          name: "sortField",
          type: "string",
          description: "The column being sorted"
        },
        {
          name: "sortOrder",
          type: "number",
          description: "The sort order (1 for asc, -1 for desc)"
        }
      ]
    },
    onSearch: {
      type: "eventHandler",
      description: "Called when search term changes",
      argTypes: [
        {
          name: "searchTerm",
          type: "string",
          description: "The search term"
        }
      ]
    },
    onBulkAction: {
      type: "eventHandler",
      description: "Called when bulk action is triggered",
      argTypes: [
        {
          name: "action",
          type: "object",
          description: "The bulk action configuration"
        },
        {
          name: "selectedRows",
          type: "object",
          description: "Array of selected row data"
        }
      ]
    },
    onGraphqlData: {
      type: "eventHandler",
      description: "Called when GraphQL data is received",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The GraphQL response data"
        }
      ]
    },
    
    // Action buttons
    rowActions: {
      type: "object",
      description: "Array of action buttons for each row",
      defaultValue: []
    },
    bulkActions: {
      type: "object",
      description: "Array of bulk action buttons",
      defaultValue: []
    },
    enableRowActions: {
      type: "boolean",
      description: "Enable row action buttons",
      defaultValue: false
    },
    fields: {
      type: "object",
      description: "Array of field keys to display as columns in the table. If empty, all fields are shown.",
      defaultValue: []
    },
    imageFields: {
      type: "object",
      description: "Array of field keys to render as images.",
      defaultValue: []
    },
    popupImageFields: {
      type: "object",
      description: "Array of image field keys that should open a popup modal when clicked.",
      defaultValue: []
    },
    
    // Filter configuration props
    dropdownFilterColumns: {
      type: "object",
      description: "Array of column keys that should use dropdown filters. Example: ['salesteam', 'status', 'category']",
      defaultValue: []
    },
    datePickerFilterColumns: {
      type: "object",
      description: "Array of column keys that should use date picker filters. Example: ['createdDate', 'updatedDate', 'dueDate']",
      defaultValue: []
    },
    numberFilterColumns: {
      type: "object",
      description: "Array of column keys that should use number filters. Example: ['amount', 'quantity', 'price']",
      defaultValue: []
    },
    textFilterColumns: {
      type: "object",
      description: "Array of column keys that should use text filters. Example: ['name', 'description', 'notes']",
      defaultValue: []
    },
    booleanFilterColumns: {
      type: "object",
      description: "Array of column keys that should use boolean filters. Example: ['isActive', 'isCompleted', 'isPublished']",
      defaultValue: []
    },
    customFilterOptions: {
      type: "object",
      description: "Object with column keys as keys and array of filter options as values. Example: { 'salesteam': [{ label: 'All', value: null }, { label: 'Team A', value: 'team_a' }] }",
      defaultValue: {}
    },
    
    // Advanced toggle features
    enableGlobalFilter: {
      type: "boolean",
      description: "Enable global filter functionality",
      defaultValue: true
    },
    enableFilterMenu: {
      type: "boolean",
      description: "Enable filter menu display",
      defaultValue: true
    },
    enableFilterMatchModes: {
      type: "boolean",
      description: "Show filter match modes in filter menus",
      defaultValue: true
    },
    enableFilterClear: {
      type: "boolean",
      description: "Show clear filter button in filter menus",
      defaultValue: true
    },
    enableFilterApply: {
      type: "boolean",
      description: "Show apply filter button in filter menus",
      defaultValue: true
    },
    enableFilterFooter: {
      type: "boolean",
      description: "Show filter footer in filter menus",
      defaultValue: true
    },

    // NEW: Filter mode toggle (Native vs Custom)
    enableFilterModeToggle: {
      type: "boolean",
      description: "Show a toolbar toggle to switch between native row filters and a custom row filter bar",
      defaultValue: false
    },
    defaultFilterMode: {
      type: "choice",
      options: ["native", "custom"],
      description: "Initial filter mode when the table renders",
      defaultValue: "native"
    },
    customRowFilterColumns: {
      type: "object",
      description: "Keys to show in the custom row filter bar. Leave empty to include all filterable columns.",
      defaultValue: []
    },
    enableGridLines: {
      type: "boolean",
      description: "Show grid lines in the table",
      defaultValue: true
    },
    enableStripedRows: {
      type: "boolean",
      description: "Enable striped row styling",
      defaultValue: true
    },
    enableHoverEffect: {
      type: "boolean",
      description: "Enable hover effects on rows",
      defaultValue: true
    },
    enableResizableColumns: {
      type: "boolean",
      description: "Allow column resizing",
      defaultValue: false
    },
    enableReorderableColumns: {
      type: "boolean",
      description: "Allow column reordering",
      defaultValue: false
    },
    enableVirtualScrolling: {
      type: "boolean",
      description: "Enable virtual scrolling for large datasets",
      defaultValue: false
    },
    enableLazyLoading: {
      type: "boolean",
      description: "Enable lazy loading for data",
      defaultValue: false
    },
    enableRowGrouping: {
      type: "boolean",
      description: "Enable row grouping functionality",
      defaultValue: false
    },
    // Row Expansion Props
    enableRowExpansion: {
      type: "boolean",
      description: "Enable row expansion functionality",
      defaultValue: false
    },
    dataKey: {
      type: "string",
      description: "Unique identifier field for rows (e.g., 'id', 'EBSCode'). HIGHEST PRIORITY - overrides auto-detection. Leave empty to use auto-detected key. Used for row expansion and selection.",
      defaultValue: null
    },
    rowExpansionTemplate: {
      type: "function",
      description: "Custom template function for expanded row content. Receives row data as parameter.",
      defaultValue: null
    },
    expandedRows: {
      type: "object",
      description: "Object controlling which rows are expanded. Use with onRowToggle for state management.",
      defaultValue: null
    },
    onRowToggle: {
      type: "function",
      description: "Callback function called when rows are expanded or collapsed. Receives event object with expanded rows data.",
      defaultValue: null
    },
    onRowExpand: {
      type: "function",
      description: "Callback function called when a row is expanded. Receives event object with row data.",
      defaultValue: null
    },
    onRowCollapse: {
      type: "function",
      description: "Callback function called when a row is collapsed. Receives event object with row data.",
      defaultValue: null
    },
    allowExpansion: {
      type: "function",
      description: "Function to determine if a row can be expanded. Receives row data and should return boolean.",
      defaultValue: null
    },
    validateExpansion: {
      type: "function",
      description: "Custom validation function for row expansion. Receives row data and should return boolean.",
      defaultValue: null
    },
    expansionColumnStyle: {
      type: "object",
      description: "Style object for the expansion column",
      defaultValue: { width: '5rem' }
    },
    expansionColumnWidth: {
      type: "string",
      description: "Width of the expansion column (e.g., '5rem', '60px')",
      defaultValue: "5rem"
    },
    expansionColumnHeader: {
      type: "string",
      description: "Custom header text for the expansion column",
      defaultValue: null
    },
    expansionColumnBody: {
      type: "function",
      description: "Custom body template for the expansion column. Receives row data and should return JSX.",
      defaultValue: null
    },
    expansionColumnPosition: {
      type: "choice",
      options: ["left", "right"],
      description: "Position of the expansion column",
      defaultValue: "left"
    },
    showExpandAllButtons: {
      type: "boolean",
      description: "Show expand/collapse all buttons in the toolbar",
      defaultValue: true
    },
    expandAllLabel: {
      type: "string",
      description: "Label for the expand all button",
      defaultValue: "Expand All"
    },
    collapseAllLabel: {
      type: "string",
      description: "Label for the collapse all button",
      defaultValue: "Collapse All"
    },
    expansionButtonStyle: {
      type: "object",
      description: "Style object for the expansion buttons",
      defaultValue: {}
    },
    expansionButtonClassName: {
      type: "string",
      description: "CSS class name for the expansion buttons",
      defaultValue: ""
    },
    nestedDataConfig: {
      type: "object",
      description: "Configuration for nested data detection and expansion template generation. Controls how nested arrays (like 'invoices') are handled.",
      defaultValue: {
        enableNestedSorting: true,
        enableNestedFiltering: false,
        enableNestedPagination: false,
        nestedPageSize: 10
      }
    },
    nestedKey: {
      type: "string",
      description: "Field name for nested data arrays (e.g., 'invoices', 'orders', 'items'). Auto-detected if not specified. Used to generate expansion templates.",
      defaultValue: null
    },
    expandIcon: {
      type: "string",
      description: "Icon class for the expand button (e.g., 'pi pi-plus')",
      defaultValue: "pi pi-plus"
    },
    collapseIcon: {
      type: "string",
      description: "Icon class for the collapse button (e.g., 'pi pi-minus')",
      defaultValue: "pi pi-minus"
    },
    enableExpansionAnimation: {
      type: "boolean",
      description: "Enable animations for row expansion/collapse",
      defaultValue: true
    },
    nestedDataConfig: {
      type: "object",
      description: "Configuration for nested data display in expanded rows",
      defaultValue: {
        enableNestedSorting: true,
        enableNestedFiltering: true,
        enableNestedPagination: false,
        nestedPageSize: 10
      }
    },
    enableFrozenColumns: {
      type: "boolean",
      description: "Enable frozen columns",
      defaultValue: false
    },
    enableFrozenRows: {
      type: "boolean",
      description: "Enable frozen rows",
      defaultValue: false
    },


    
    // Advanced filter options
    filterDisplay: {
      type: "choice",
      options: ["menu", "row"],
      description: "Display mode for filters",
      defaultValue: "menu"
    },
    globalFilterFields: {
      type: "object",
      description: "Array of field names to include in global filter",
      defaultValue: []
    },
    showFilterMatchModes: {
      type: "boolean",
      description: "Show filter match modes",
      defaultValue: true
    },

    
    // Table styling options
    tableSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Size of the table",
      defaultValue: "normal"
    },
    responsiveLayout: {
      type: "choice",
      options: ["scroll", "reflow", "stack"],
      description: "Native PrimeReact responsive layout: scroll (horizontal scroll), reflow (stacks columns), stack (alternative stacking)",
      defaultValue: "scroll"
    },
    
    // NEW: Register layout / numbering / editor column
    tableVariant: {
      type: "choice",
      options: ["default", "register"],
      description: "Table layout variant (default or register-style)",
      defaultValue: "default"
    },
    showRowNumbers: {
      type: "boolean",
      description: "Show row number column (No.)",
      defaultValue: false
    },
    rowNumberColumnHeader: {
      type: "string",
      description: "Header text for the row number column",
      defaultValue: "No."
    },
    rowNumberColumnWidth: {
      type: "string",
      description: "Width of the row number column (e.g., '4rem')",
      defaultValue: "4rem"
    },
    enableRowEditorColumn: {
      type: "boolean",
      description: "Show PrimeReact row editor action column (requires inline editing)",
      defaultValue: false
    },
    rowEditorColumnWidth: {
      type: "string",
      description: "Width of the row editor action column",
      defaultValue: "8rem"
    },

    
    // Custom templates
    customTemplates: {
      type: "object",
      description: "Custom cell templates for specific columns",
      defaultValue: {}
    },

    customFormatters: {
      type: "object",
      description: "Custom formatters for specific columns",
      defaultValue: {}
    },
    
    // Footer totals props
    enableFooterTotals: {
      type: "boolean",
      description: "Enable footer totals for numeric columns",
      defaultValue: false
    },
    enableFixedFooterTotals: {
      type: "boolean",
      description: "Always show footer totals at bottom of table, even when pivot is used",
      defaultValue: false
    },
    footerTotalsConfig: {
      type: "object",
      description: "Configuration for footer totals (showTotals, showAverages, showCounts, numberFormat, currency, precision)",
      defaultValue: {
        showTotals: true,
        showAverages: false,
        showCounts: true,
        numberFormat: 'en-US',
        currency: 'USD',
        precision: 2
      }
    },
    currencyColumns: {
      type: "object",
      description: "Array of column keys to be formatted as currency in footer totals",
      defaultValue: []
    },

    // ROI Calculation Props
    enableROICalculation: {
      type: "boolean",
      description: "Enable ROI calculation feature",
      defaultValue: false
    },
    roiConfig: {
      type: "object",
      description: "Configuration for ROI calculation including field names, calculation method, display options, and color coding",
      defaultValue: {
        revenueField: 'revenue',
        costField: 'cost',
        investmentField: 'investment',
        profitField: 'profit',
        calculationMethod: 'standard',
        showROIColumn: true,
        showROIAsPercentage: true,
        roiColumnTitle: 'ROI (%)',
        roiColumnKey: 'roi',
        roiNumberFormat: 'en-US',
        roiPrecision: 2,
        roiCurrency: 'USD',
        enableROIColorCoding: true,
        roiColorThresholds: {
          positive: '#22c55e',
          neutral: '#6b7280',
          negative: '#ef4444'
        },
        positiveROIThreshold: 0,
        negativeROIThreshold: 0,
        customROICalculation: null
      }
    },

    // Column grouping props
    enableColumnGrouping: {
      type: "boolean",
      description: "Enable column grouping functionality",
      defaultValue: false
    },
    headerColumnGroup: {
      type: "object",
      description: "Custom header column group component",
      defaultValue: null
    },
    footerColumnGroup: {
      type: "object",
      description: "Custom footer column group component",
      defaultValue: null
    },
    columnGroups: {
      type: "object",
      description: "Array of column group configurations",
      defaultValue: []
    },
    groupConfig: {
      type: "object",
      description: "Configuration for column grouping styling and behavior. Object with properties like enableHeaderGroups, enableFooterGroups, groupSeparator, ungroupedColumns, totalColumns, customGroupMappings, etc.",
      defaultValue: {
        enableHeaderGroups: true,
        enableFooterGroups: true,
        groupStyle: {},
        headerGroupStyle: {},
        footerGroupStyle: {},
        groupSeparator: '__',
        ungroupedColumns: [],
        totalColumns: [],
        customGroupMappings: {},
        groupingPatterns: []
      }
    },

    // Merge support (auto-merge only)
    enableMerge: {
      type: "boolean",
      description: "Enable automatic data merging for objects with arrays (auto-detected keys)",
      defaultValue: false
    },
    enableAutoColumnGrouping: {
      type: "boolean",
      description: "Enable automatic column grouping based on merged data or column patterns",
      defaultValue: false
    },


    
    // Advanced filter options
    filterDelay: {
      type: "number",
      description: "Delay in milliseconds before applying filter",
      defaultValue: 300
    },
    globalFilterPlaceholder: {
      type: "string",
      description: "Placeholder text for global search input",
      defaultValue: "Search..."
    },
    filterLocale: {
      type: "string",
      description: "Locale for filter formatting",
      defaultValue: "en"
    },
    // Native PrimeReact editing
    editMode: {
      type: "choice",
      options: ["cell", "row"],
      description: "PrimeReact native editing mode: cell (click to edit individual cells) or row (edit entire row)",
      defaultValue: null
    },
    editableColumns: {
      type: "object",
      description: "Array of column keys that should be editable (auto-creates appropriate editors based on data type)",
      defaultValue: []
    },
    useCustomRowEditor: {
      type: "boolean",
      description: "If true and editMode='row', opens custom dialog form instead of native inline editing",
      defaultValue: false
    },
    viewMode: {
      type: "choice",
      options: ["table", "cards", "form"],
      description: "Layout presentation: table (default DataTable), cards (grid of cards), form (form-style cards)",
      defaultValue: "table"
    },
    
    // Toolbar Size Control Props
    toolbarSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Controls the size of toolbar components (small, normal, large)",
      defaultValue: "normal"
    },
    leftToolbarSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Override toolbar size for left section (search, filters, etc.)",
      defaultValue: "normal"
    },
    rightToolbarSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Override toolbar size for right section (bulk actions, export, etc.)",
      defaultValue: "normal"
    },
    enableToolbarInCardForm: {
      type: "boolean",
      description: "Enable full toolbar functionality in card/form modes (disabled by default)",
      defaultValue: false
    },
    onRowDelete: {
      type: "eventHandler",
      argTypes: [{ name: "data", type: "object" }],
      description: "Callback function called when delete button is clicked on a row"
    },
    editingRows: {
      type: "object",
      description: "Currently editing rows",
      defaultValue: null
    },
    onRowEditSave: {
      type: "eventHandler",
      description: "Called when row edit is saved",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Row edit save event"
        }
      ]
    },
    
    onRowEditCancel: {
      type: "eventHandler",
      description: "Called when row edit is cancelled",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Row edit cancel event"
        }
      ]
    },
    onRowEditInit: {
      type: "eventHandler",
      description: "Called when row edit is initialized",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Row edit init event"
        }
      ]
    },
    onEditingRowsChange: {
      type: "eventHandler",
      description: "Called when editing rows change",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Editing rows change event"
        }
      ]
    },
    
    // Context menu
    enableContextMenu: {
      type: "boolean",
      description: "Enable context menu on right-click",
      defaultValue: false
    },
    contextMenu: {
      type: "object",
      description: "Context menu items configuration",
      defaultValue: null
    },
    contextMenuSelection: {
      type: "object",
      description: "Currently selected context menu item",
      defaultValue: null
    },
    onContextMenuSelectionChange: {
      type: "eventHandler",
      description: "Called when context menu selection changes",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Context menu selection change event"
        }
      ]
    },
    onContextMenu: {
      type: "eventHandler",
      description: "Called when context menu is triggered",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Context menu event"
        }
      ]
    },
    
    // Advanced pagination
    showFirstLastIcon: {
      type: "boolean",
      description: "Show first/last page icons in pagination",
      defaultValue: true
    },
    showPageLinks: {
      type: "boolean",
      description: "Show page number links in pagination",
      defaultValue: true
    },
    showCurrentPageReport: {
      type: "boolean",
      description: "Show current page report in pagination",
      defaultValue: true
    },
    currentPageReportTemplate: {
      type: "string",
      description: "Template for current page report",
      defaultValue: "Showing {first} to {last} of {totalRecords} entries"
    },
    
    // Advanced export
    exportFilename: {
      type: "string",
      description: "Filename for exported data",
      defaultValue: "data"
    },
    exportFileType: {
      type: "choice",
      options: ["csv", "excel", "pdf"],
      description: "File type for export",
      defaultValue: "csv"
    },
    enableExcelExport: {
      type: "boolean",
      description: "Enable Excel export functionality",
      defaultValue: false
    },
    enablePdfExport: {
      type: "boolean",
      description: "Enable PDF export functionality",
      defaultValue: false
    },
    exportExpandedData: {
      type: "boolean",
      description: "Include full nested object/array details in export (detailed view)",
      defaultValue: false
    },
    exportNestedAsColumns: {
      type: "boolean", 
      description: "Flatten nested objects as separate columns (creates Invoices[0].id, Invoices[0].amount, etc.)",
      defaultValue: false
    },
    
    // Advanced selection
    selectionMode: {
      type: "choice",
      options: ["single", "multiple", "checkbox"],
      description: "Selection mode for rows",
      defaultValue: "multiple"
    },
    metaKeySelection: {
      type: "boolean",
      description: "Enable meta key selection",
      defaultValue: true
    },
    selectOnEdit: {
      type: "boolean",
      description: "Select row when editing",
      defaultValue: false
    },
    
    // Auto Column Grouping props
    enableAutoColumnGrouping: {
      type: "boolean",
      description: "Enable automatic column grouping based on column name patterns",
      defaultValue: false
    },
    groupSeparator: {
      type: "string",
      description: "Separator used to detect column groups (e.g., '__' for '2025-04-01__serviceAmount')",
      defaultValue: "__"
    },
    ungroupedColumns: {
      type: "object",
      description: "Array of column keys that should remain ungrouped (e.g., ['drCode', 'drName', 'salesTeam'])",
      defaultValue: []
    },
    totalColumns: {
      type: "object",
      description: "Array of column keys that represent totals (e.g., ['serviceAmount Total', 'supportValue Total'])",
      defaultValue: []
    },
    customGroupMappings: {
      type: "object",
      description: "Custom mappings for column grouping. Object with keywords as keys and group names as values (e.g., { 'inventory': 'Inventory Management', 'warehouse': 'Warehouse Operations' })",
      defaultValue: {}
    },
    groupingPatterns: {
      type: "object",
      description: "Array of custom regex patterns for advanced grouping scenarios",
      defaultValue: []
    },
    enableHeaderGroups: {
      type: "boolean",
      description: "Show grouped headers in the table",
      defaultValue: true
    },
    enableFooterGroups: {
      type: "boolean",
      description: "Show grouped footers in the table",
      defaultValue: true
    },
    headerGroupStyle: {
      type: "object",
      description: "CSS styles for group headers (e.g., { backgroundColor: '#e3f2fd', fontWeight: 'bold', textAlign: 'center' })",
      defaultValue: {}
    },
    groupStyle: {
      type: "object",
      description: "CSS styles for sub-headers (e.g., { backgroundColor: '#f5f5f5', fontSize: '0.9em' })",
      defaultValue: {}
    },
    footerGroupStyle: {
      type: "object",
      description: "CSS styles for group footers",
      defaultValue: {}
    },
    
    // Pivot Table Props - Excel-like pivot functionality
    enablePivotTable: {
      type: "boolean",
      description: "Enable Excel-like pivot table functionality",
      defaultValue: false
    },
    
    // NEW: Pivot UI Configuration Props
    enablePivotUI: {
      type: "boolean",
      description: "Enable pivot table configuration UI panel with dropdowns populated from data",
      defaultValue: true
    },
    pivotUIPosition: {
      type: "choice",
      options: ["toolbar", "panel", "sidebar"],
      description: "Position of the pivot configuration UI",
      defaultValue: "toolbar"
    },
    
    // NEW: CMS Persistence Props
    enablePivotPersistence: {
      type: "boolean",
      description: "Enable saving pivot configuration to CMS for persistence across refreshes",
      defaultValue: true
    },
    pivotConfigKey: {
      type: "string",
      description: "Key for storing pivot configuration in CMS (unique identifier)",
      defaultValue: ""
    },
    autoSavePivotConfig: {
      type: "boolean",
      description: "Automatically save pivot configuration changes to CMS (disable for manual save with 'Apply & Save' button)",
      defaultValue: false
    },
    
    // NEW: Direct Plasmic CMS Integration Props
    plasmicWorkspaceId: {
      type: "string",
      description: "Plasmic workspace ID for CMS integration (optional - uses env var if not provided)",
      defaultValue: ""
    },
    plasmicTableConfigsId: {
      type: "string",
      description: "TableConfigs table ID for CMS integration (optional - uses env var if not provided)",
      defaultValue: ""
    },
    plasmicApiToken: {
      type: "string",
      description: "Plasmic API token for direct CMS integration (optional - uses env var if not provided)",
      defaultValue: ""
    },
    useDirectCMSIntegration: {
      type: "boolean",
      description: "Use direct CMS integration instead of callback props",
      defaultValue: true
    },
    
    // DEPRECATED: Callback-based CMS Props (use direct integration instead)
    onSavePivotConfig: {
      type: "eventHandler",
      description: "DEPRECATED: Called to save pivot configuration to CMS (use direct integration instead)",
      argTypes: [
        {
          name: "configKey",
          type: "string",
          description: "The configuration key"
        },
        {
          name: "pivotConfig",
          type: "object",
          description: "The pivot configuration object to save"
        }
      ]
    },
    onLoadPivotConfig: {
      type: "eventHandler",
      description: "DEPRECATED: Called to load pivot configuration from CMS (use direct integration instead)",
      argTypes: [
        {
          name: "configKey",
          type: "string",
          description: "The configuration key to load"
        }
      ]
    },
    
    pivotRows: {
      type: "object",
      description: "Array of field names to use as row grouping (like Excel's 'Rows' area). Example: ['drName', 'salesTeam']",
      defaultValue: []
    },
    pivotColumns: {
      type: "object", 
      description: "Array of field names to use as column headers (like Excel's 'Columns' area). Example: ['date', 'category']",
      defaultValue: []
    },
    pivotValues: {
      type: "object",
      description: "Array of value configuration objects with field and aggregation. Example: [{ field: 'serviceAmount', aggregation: 'sum' }, { field: 'supportValue', aggregation: 'average' }]",
      defaultValue: []
    },
    pivotFilters: {
      type: "object",
      description: "Array of field names to use as pivot filters (like Excel's 'Filters' area). Example: ['region', 'status']",
      defaultValue: []
    },
    pivotShowGrandTotals: {
      type: "boolean",
      description: "Show grand total row in pivot table",
      defaultValue: true
    },
    pivotShowRowTotals: {
      type: "boolean",
      description: "Show row totals column in pivot table",
      defaultValue: true
    },
    pivotShowColumnTotals: {
      type: "boolean",
      description: "Show column totals in pivot table",
      defaultValue: true
    },
    pivotShowSubTotals: {
      type: "boolean",
      description: "Show subtotals in pivot table",
      defaultValue: true
    },
    pivotNumberFormat: {
      type: "string",
      description: "Number format locale for pivot table (e.g., 'en-US', 'de-DE')",
      defaultValue: "en-US"
    },
    pivotCurrency: {
      type: "string",
      description: "Currency code for pivot table formatting (e.g., 'USD', 'EUR', 'GBP')",
      defaultValue: "USD"
    },
    pivotPrecision: {
      type: "number",
      description: "Number of decimal places for pivot table numbers",
      defaultValue: 2
    },
    pivotFieldSeparator: {
      type: "string",
      description: "Separator for parsing complex field names like '2025-04-01__serviceAmount'",
      defaultValue: "__"
    },
    pivotSortRows: {
      type: "boolean",
      description: "Sort row values in pivot table",
      defaultValue: true
    },
    pivotSortColumns: {
      type: "boolean",
      description: "Sort column values in pivot table",
      defaultValue: true
    },
    pivotSortDirection: {
      type: "choice",
      options: ["asc", "desc"],
      description: "Sort direction for pivot table",
      defaultValue: "asc"
    },
    pivotAggregationFunctions: {
      type: "object",
      description: "Custom aggregation functions for pivot table. Object with function names as keys",
      defaultValue: {}
    },
    
    // Expandable Table Props
    rowExpansionTemplate: {
      type: "function",
      description: "Custom template function for expanded row content. Receives row data as parameter. Example: (data) => <div>Details for {data.name}</div>",
      defaultValue: null
    },
    expandedRows: {
      type: "object",
      description: "Object controlling which rows are expanded. Use with onRowToggle for state management. Example: { 1: true, 3: true }",
      defaultValue: null
    },
    onRowToggle: {
      type: "eventHandler",
      description: "Callback function called when rows are expanded or collapsed. Receives event object with expanded rows data.",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Event object containing expanded rows data"
        }
      ]
    }
  },
  
  importPath: "./components/PrimeDataTable"
});

// Register the Simple Data Table component (Simplified version of PrimeDataTable)
  PLASMIC.registerComponent(SimpleDataTable, {
    name: "SimpleDataTable",
    displayName: "Simple Data Table",
    description: "A simplified, clean data table with basic features: sorting, filtering, pagination, row expansion, and Excel export. Toggle between native and custom UI. Uses em/rem units for responsive design. 86% smaller than PrimeDataTable.",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "Array of data objects to display in the table",
      defaultValue: []
    },
    columns: {
      type: "object",
      description: "Array of column definitions with key, title, sortable, filterable, type, etc. Auto-generated if not provided.",
      defaultValue: []
    },
    loading: {
      type: "boolean",
      description: "Whether the table is in loading state",
      defaultValue: false
    },
    
    // Feature toggles
    enableSearch: {
      type: "boolean",
      description: "Enable global search functionality",
      defaultValue: true
    },
    enableGlobalSearch: {
      type: "boolean",
      description: "Enable/disable global search bar in toolbar (when false, search bar is hidden)",
      defaultValue: true
    },
    enableSorting: {
      type: "boolean",
      description: "Enable column sorting",
      defaultValue: true
    },
    enablePagination: {
      type: "boolean",
      description: "Enable pagination controls",
      defaultValue: true
    },
    enableRowExpansion: {
      type: "boolean",
      description: "Enable row expansion for nested data with auto-detection",
      defaultValue: false
    },
    
    // UI Mode Toggles - UNIQUE FEATURE
    useCustomFilters: {
      type: "boolean",
      description: "Toggle: Use custom filter row instead of native PrimeReact filters (better UX, all filters visible at once)",
      defaultValue: false
    },
    useCustomToolbar: {
      type: "boolean",
      description: "Toggle: Use custom toolbar instead of native PrimeReact toolbar (modern design, better mobile layout)",
      defaultValue: false
    },
    searchOnlyFilters: {
      type: "boolean",
      description: "Force all filters to be simple text search inputs - no filter menu icon, just type to filter (works on all data types)",
      defaultValue: false
    },
    equalColumnWidths: {
      type: "boolean",
      description: "Give all columns equal fixed width of 9.5rem (152px) to avoid congestion",
      defaultValue: true
    },
    
    // Configuration
    pageSize: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    pageSizeOptions: {
      type: "object",
      description: "Array of page size options",
      defaultValue: [5, 10, 25, 50]
    },
    dataKey: {
      type: "string",
      description: "Unique identifier field for rows (e.g., 'id', 'code'). Auto-detected if not provided. Required for row expansion.",
      defaultValue: "id"
    },
    
    // Row expansion props
    rowExpansionTemplate: {
      type: "function",
      description: "Custom template function for expanded row content. Receives row data as parameter. Auto-generated if not provided.",
      defaultValue: null
    },
    nestedDataKey: {
      type: "string",
      description: "Key name for nested data in rows (e.g., 'items', 'orders', 'invoices'). Auto-detected if not provided.",
      defaultValue: "items"
    },
    
    // Styling
    tableSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Size of the table with responsive em/rem units",
      defaultValue: "normal"
    },
    compactTextInSmall: {
      type: "boolean",
      description: "Enable compact text mode (12px cells, 14px headers) - ONLY works when tableSize is 'small'",
      defaultValue: false
    },
    responsiveLayout: {
      type: "choice",
      options: ["scroll", "reflow", "stack"],
      description: "Native PrimeReact responsive layout mode",
      defaultValue: "scroll"
    },
    stickyFirstColumn: {
      type: "boolean",
      description: "Make first column sticky/frozen during horizontal scroll (remains visible while other columns scroll)",
      defaultValue: false
    },
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    },
    
    // Footer Totals (Power BI style)
    enableFooterTotals: {
      type: "boolean",
      description: "Enable column-wise totals in footer (like Power BI)",
      defaultValue: false
    },
    footerTotalsType: {
      type: "choice",
      options: ["sum", "average", "count", "min", "max"],
      description: "Type of calculation for footer totals: sum (default), average, count, min, or max",
      defaultValue: "sum"
    },
    
    // Event handlers
    onRowClick: {
      type: "eventHandler",
      description: "Called when a parent row is clicked",
      argTypes: [
        {
          name: "rowData",
          type: "object",
          description: "The clicked row data"
        },
        {
          name: "index",
          type: "number",
          description: "The row index"
        }
      ]
    },
    onChildRowClick: {
      type: "eventHandler",
      description: "Called when a child/nested row (in expansion table) is clicked",
      argTypes: [
        {
          name: "childRowData",
          type: "object",
          description: "The clicked child row data"
        },
        {
          name: "childIndex",
          type: "number",
          description: "The child row index"
        },
        {
          name: "parentRowData",
          type: "object",
          description: "The parent row data (for context)"
        }
      ]
    },
    onRefresh: {
      type: "eventHandler",
      description: "Called when refresh button is clicked",
      argTypes: []
    }
  },
  
  importPath: "./components/SimpleDataTable"
});

// Register ExportDataButton component
PLASMIC.registerComponent(ExportDataButton, {
  name: "ExportDataButton",
  displayName: "Export Data Button",
  description: "A standalone export button that exports data to CSV or Excel (XLSX). Automatically detects and handles nested/expansion data. No table required - just pass data as props. Features format selection modal, multiple sizes/variants, and custom styling.",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "Array of data objects to export (Required). Supports simple arrays or nested arrays with child data.",
      defaultValue: []
    },
    columns: {
      type: "object",
      description: "Array of column definitions with key and title. Auto-generated from data if not provided. Example: [{ key: 'id', title: 'ID' }, { key: 'name', title: 'Name' }]",
      defaultValue: []
    },
    nestedDataKey: {
      type: "string",
      description: "Key name for nested data arrays (e.g., 'items', 'employees', 'orders'). Component auto-detects: 'items', 'children', 'HQs'",
      defaultValue: "items"
    },
    
    // Button Configuration
    label: {
      type: "string",
      description: "Button label text",
      defaultValue: "Export"
    },
    size: {
      type: "choice",
      options: ["small", "medium", "large"],
      description: "Button size: small (14px icon), medium (16px icon), large (18px icon)",
      defaultValue: "medium"
    },
    variant: {
      type: "choice",
      options: ["primary", "secondary", "outline", "light"],
      description: "Button style variant: primary (blue), secondary (gray), outline (border), light (white with shadow)",
      defaultValue: "primary"
    },
    iconPosition: {
      type: "choice",
      options: ["left", "right"],
      description: "Position of the download icon: left or right of the label",
      defaultValue: "left"
    },
    iconOnly: {
      type: "boolean",
      description: "Show only icon without label (button becomes icon-only)",
      defaultValue: false
    },
    disabled: {
      type: "boolean",
      description: "Disable the button (also auto-disables when data is empty)",
      defaultValue: false
    },
    
    // UI Options
    useNativeButton: {
      type: "boolean",
      description: "Use PrimeReact native button instead of custom styled button",
      defaultValue: false
    },
    className: {
      type: "string",
      description: "Additional CSS classes for the button",
      defaultValue: ""
    },
    buttonStyle: {
      type: "object",
      description: "Inline styles for custom button styling. Example: { backgroundColor: '#8b5cf6', borderRadius: '9999px' }",
      defaultValue: {}
    },
    
    // Event handlers
    onExportStart: {
      type: "eventHandler",
      description: "Called when export starts (user selects format)",
      argTypes: [
        {
          name: "format",
          type: "string",
          description: "Export format: 'csv' or 'excel'"
        }
      ]
    },
    onExportComplete: {
      type: "eventHandler",
      description: "Called when export completes (file download triggered)",
      argTypes: [
        {
          name: "format",
          type: "string",
          description: "Export format: 'csv' or 'excel'"
        }
      ]
    }
  },
  
  importPath: "./components/ExportDataButton"
});

// Register FileImportButton component
PLASMIC.registerComponent(FileImportButton, {
  name: "FileImportButton",
  displayName: "File Import Button",
  description: "A component to upload and import CSV/Excel files (.csv, .xlsx, .xls) and convert them to JSON arrays. Features preview dialog, progress indicator, and automatic state management.",
  
  props: {
    // Data handling
    onImportComplete: {
      type: "eventHandler",
      description: "Callback function called with imported data array and file name",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "Array of objects containing the imported data"
        },
        {
          name: "fileName",
          type: "string",
          description: "Name of the imported file"
        }
      ]
    },
    stateKey: {
      type: "string",
      description: "Optional key to save data to global state ($ctx.state[stateKey]). After import, access data via $ctx.state.{stateKey}",
      defaultValue: ""
    },
    setState: {
      type: "function",
      description: "Optional setState function. Bind to $ctx.fn.setState in Plasmic Studio for automatic state management",
      defaultValue: undefined
    },
    
    // Button Configuration
    label: {
      type: "string",
      description: "Button label text",
      defaultValue: "Import File"
    },
    size: {
      type: "choice",
      options: ["small", "medium", "large"],
      description: "Button size: small, medium, or large",
      defaultValue: "medium"
    },
    variant: {
      type: "choice",
      options: ["primary", "secondary", "outline", "light"],
      description: "Button style variant: primary (blue), secondary (gray), outline (blue border, white background), light (white with shadow)",
      defaultValue: "outline"
    },
    iconPosition: {
      type: "choice",
      options: ["left", "right"],
      description: "Position of the upload icon: left or right of the label",
      defaultValue: "left"
    },
    iconOnly: {
      type: "boolean",
      description: "Show only icon without label (button becomes icon-only)",
      defaultValue: false
    },
    disabled: {
      type: "boolean",
      description: "Disable the button",
      defaultValue: false
    },
    className: {
      type: "string",
      description: "Additional CSS classes for the button",
      defaultValue: ""
    },
    
    // Import Options
    showPreview: {
      type: "boolean",
      description: "Show preview dialog after successful import",
      defaultValue: true
    },
    maxFileSize: {
      type: "number",
      description: "Maximum file size in MB (default: 10MB)",
      defaultValue: 10
    },
    firstRowAsHeader: {
      type: "boolean",
      description: "Use first row as column headers (CSV only, Excel always uses headers)",
      defaultValue: true
    },
    
    // Error handling
    onError: {
      type: "eventHandler",
      description: "Callback function called when an error occurs during import",
      argTypes: [
        {
          name: "error",
          type: "object",
          description: "Error object with message and details"
        }
      ]
    }
  },
  
  importPath: "./components/FileImportButton"
});

// Register the Optimized PrimeReact Data Table component
// PLASMIC.registerComponent(PrimeDataTableOptimized, {
//   name: "PrimeDataTableOptimized",
//   displayName: "Optimized PrimeReact Data Table",
//   description: "OPTIMIZED VERSION: A comprehensive data table component built with PrimeReact DataTable, featuring advanced search, filtering, sorting, pagination, pivot tables, auto-merge, column grouping, and CMS integration. Reduced from 3349 lines to 904 lines (73% smaller) while maintaining all features.",
  
//   props: {
//     // Data props
//     data: {
//       type: "object",
//       description: "Array of data objects to display in the table",
//       defaultValue: []
//     },
//     columns: {
//       type: "object",
//       description: "Array of column definitions with key, title, sortable, filterable, type, etc.",
//       defaultValue: []
//     },
//     loading: {
//       type: "boolean",
//       description: "Whether the table is in loading state",
//       defaultValue: false
//     },
//     error: {
//       type: "string",
//       description: "Error message to display",
//       defaultValue: null
//     },
    
//     // GraphQL props
//     graphqlQuery: {
//       type: "string",
//       description: "GraphQL query string to fetch data",
//       defaultValue: null
//     },
//     graphqlVariables: {
//       type: "object",
//       description: "Variables for the GraphQL query",
//       defaultValue: {}
//     },
//     refetchInterval: {
//       type: "number",
//       description: "Interval in milliseconds to refetch GraphQL data (0 = disabled)",
//       defaultValue: 0
//     },
    
//     // Table configuration
//     enableSearch: {
//       type: "boolean",
//       description: "Enable global search functionality",
//       defaultValue: true
//     },
//     enableColumnFilter: {
//       type: "boolean",
//       description: "Enable column-specific filtering",
//       defaultValue: true
//     },
//     enableSorting: {
//       type: "boolean",
//       description: "Enable column sorting",
//       defaultValue: true
//     },
//     enablePagination: {
//       type: "boolean",
//       description: "Enable pagination controls",
//       defaultValue: true
//     },
//     enableRowSelection: {
//       type: "boolean",
//       description: "Enable row selection with checkboxes",
//       defaultValue: false
//     },
//     enableExport: {
//       type: "boolean",
//       description: "Enable CSV export functionality",
//       defaultValue: true
//     },
//     enableRefresh: {
//       type: "boolean",
//       description: "Enable manual refresh button",
//       defaultValue: false
//     },
//     enableColumnManagement: {
//       type: "boolean",
//       description: "Enable column visibility management",
//       defaultValue: true
//     },
//     enableBulkActions: {
//       type: "boolean",
//       description: "Enable bulk actions for selected rows",
//       defaultValue: false
//     },
    
//     // Pagination
//     pageSize: {
//       type: "number",
//       description: "Number of items per page",
//       defaultValue: 10
//     },
//     currentPage: {
//       type: "number",
//       description: "Current page number",
//       defaultValue: 1
//     },
//     pageSizeOptions: {
//       type: "object",
//       description: "Array of page size options",
//       defaultValue: [5, 10, 25, 50, 100]
//     },
    
//     // Styling
//     className: {
//       type: "string",
//       description: "Additional CSS classes for the table container",
//       defaultValue: ""
//     },
//     style: {
//       type: "object",
//       description: "Inline styles for the table container",
//       defaultValue: {}
//     },
    
//     // Event handlers
//     onRowClick: {
//       type: "eventHandler",
//       description: "Called when a row is clicked",
//       argTypes: [
//         {
//           name: "row",
//           type: "object",
//           description: "The clicked row data"
//         },
//         {
//           name: "index",
//           type: "number",
//           description: "The row index"
//         }
//       ]
//     },
//     onRowSelect: {
//       type: "eventHandler",
//       description: "Called when row selection changes",
//       argTypes: [
//         {
//           name: "selectedRows",
//           type: "object",
//           description: "Array of selected row data"
//         }
//       ]
//     },
//     onExport: {
//       type: "eventHandler",
//       description: "Called when export is triggered",
//       argTypes: [
//         {
//           name: "data",
//           type: "object",
//           description: "The data being exported"
//         }
//       ]
//     },
//     onRefresh: {
//       type: "eventHandler",
//       description: "Called when refresh is triggered",
//       argTypes: []
//     },
//     onPageChange: {
//       type: "eventHandler",
//       description: "Called when page changes",
//       argTypes: [
//         {
//           name: "page",
//           type: "number",
//           description: "The new page number"
//         }
//       ]
//     },
//     onFilterChange: {
//       type: "eventHandler",
//       description: "Called when filters change",
//       argTypes: [
//         {
//           name: "filters",
//           type: "object",
//           description: "The current filters state"
//         }
//       ]
//     },
//     onSortChange: {
//       type: "eventHandler",
//       description: "Called when sorting changes",
//       argTypes: [
//         {
//           name: "sortField",
//           type: "string",
//           description: "The column being sorted"
//         },
//         {
//           name: "sortOrder",
//           type: "number",
//           description: "The sort order (1 for asc, -1 for desc)"
//         }
//       ]
//     },
//     onSearch: {
//       type: "eventHandler",
//       description: "Called when search term changes",
//       argTypes: [
//         {
//           name: "searchTerm",
//           type: "string",
//           description: "The search term"
//         }
//       ]
//     },
//     onBulkAction: {
//       type: "eventHandler",
//       description: "Called when bulk action is triggered",
//       argTypes: [
//         {
//           name: "action",
//           type: "object",
//           description: "The bulk action configuration"
//         },
//         {
//           name: "selectedRows",
//           type: "object",
//           description: "Array of selected row data"
//         }
//       ]
//     },
//     onGraphqlData: {
//       type: "eventHandler",
//       description: "Called when GraphQL data is received",
//       argTypes: [
//         {
//           name: "data",
//           type: "object",
//           description: "The GraphQL response data"
//         }
//       ]
//     },
    
//     // Action buttons
//     rowActions: {
//       type: "object",
//       description: "Array of action buttons for each row",
//       defaultValue: []
//     },
//     bulkActions: {
//       type: "object",
//       description: "Array of bulk action buttons",
//       defaultValue: []
//     },
//     enableRowActions: {
//       type: "boolean",
//       description: "Enable row action buttons",
//       defaultValue: false
//     },
//     fields: {
//       type: "object",
//       description: "Array of field keys to display as columns in the table. If empty, all fields are shown.",
//       defaultValue: []
//     },
//     imageFields: {
//       type: "object",
//       description: "Array of field keys to render as images.",
//       defaultValue: []
//     },
//     popupImageFields: {
//       type: "object",
//       description: "Array of image field keys that should open a popup modal when clicked.",
//       defaultValue: []
//     },
    
//     // Filter configuration props
//     dropdownFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use dropdown filters. Example: ['salesteam', 'status', 'category']",
//       defaultValue: []
//     },
//     datePickerFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use date picker filters. Example: ['createdDate', 'updatedDate', 'dueDate']",
//       defaultValue: []
//     },
//     numberFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use number filters. Example: ['amount', 'quantity', 'price']",
//       defaultValue: []
//     },
//     textFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use text filters. Example: ['name', 'description', 'notes']",
//       defaultValue: []
//     },
//     booleanFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use boolean filters. Example: ['isActive', 'isCompleted', 'isPublished']",
//       defaultValue: []
//     },
//     customFilterOptions: {
//       type: "object",
//       description: "Object with column keys as keys and array of filter options as values. Example: { 'salesteam': [{ label: 'All', value: null }, { label: 'Team A', value: 'team_a' }] }",
//       defaultValue: {}
//     },
    
//     // Advanced toggle features
//     enableGlobalFilter: {
//       type: "boolean",
//       description: "Enable global filter functionality",
//       defaultValue: true
//     },
//     enableFilterMenu: {
//       type: "boolean",
//       description: "Enable filter menu display",
//       defaultValue: true
//     },
//     enableFilterMatchModes: {
//       type: "boolean",
//       description: "Show filter match modes in filter menus",
//       defaultValue: true
//     },
//     enableFilterClear: {
//       type: "boolean",
//       description: "Show clear filter button in filter menus",
//       defaultValue: true
//     },
//     enableFilterApply: {
//       type: "boolean",
//       description: "Show apply filter button in filter menus",
//       defaultValue: true
//     },
//     enableFilterFooter: {
//       type: "boolean",
//       description: "Show filter footer in filter menus",
//       defaultValue: true
//     },
//     enableGridLines: {
//       type: "boolean",
//       description: "Show grid lines in the table",
//       defaultValue: true
//     },
//     enableStripedRows: {
//       type: "boolean",
//       description: "Enable striped row styling",
//       defaultValue: true
//     },
//     enableHoverEffect: {
//       type: "boolean",
//       description: "Enable hover effects on rows",
//       defaultValue: true
//     },
//     enableResizableColumns: {
//       type: "boolean",
//       description: "Allow column resizing",
//       defaultValue: false
//     },
//     enableReorderableColumns: {
//       type: "boolean",
//       description: "Allow column reordering",
//       defaultValue: false
//     },
//     enableVirtualScrolling: {
//       type: "boolean",
//       description: "Enable virtual scrolling for large datasets",
//       defaultValue: false
//     },
//     enableLazyLoading: {
//       type: "boolean",
//       description: "Enable lazy loading for data",
//       defaultValue: false
//     },
//     enableRowGrouping: {
//       type: "boolean",
//       description: "Enable row grouping functionality",
//       defaultValue: false
//     },
//     enableRowExpansion: {
//       type: "boolean",
//       description: "Enable row expansion functionality",
//       defaultValue: false
//     },
//     rowExpansionTemplate: {
//       type: "function",
//       description: "Custom template function for expanded row content. Receives row data as parameter.",
//       defaultValue: null
//     },
//     expandedRows: {
//       type: "object",
//       description: "Object controlling which rows are expanded. Use with onRowToggle for state management.",
//       defaultValue: null
//     },
//     onRowToggle: {
//       type: "function",
//       description: "Callback function called when rows are expanded or collapsed. Receives event object with expanded rows data.",
//       defaultValue: null
//     },
//     enableFrozenColumns: {
//       type: "boolean",
//       description: "Enable frozen columns",
//       defaultValue: false
//     },
//     enableFrozenRows: {
//       type: "boolean",
//       description: "Enable frozen rows",
//       defaultValue: false
//     },
    
//     // Advanced filter options
//     filterDisplay: {
//       type: "choice",
//       options: ["menu", "row"],
//       description: "Display mode for filters",
//       defaultValue: "menu"
//     },
//     globalFilterFields: {
//       type: "object",
//       description: "Array of field names to include in global filter",
//       defaultValue: []
//     },
//     showFilterMatchModes: {
//       type: "boolean",
//       description: "Show filter match modes",
//       defaultValue: true
//     },
    
//     // Table styling options
//     tableSize: {
//       type: "choice",
//       options: ["small", "normal", "large"],
//       description: "Size of the table",
//       defaultValue: "normal"
//     },
    
//     // Custom templates
//     customTemplates: {
//       type: "object",
//       description: "Custom cell templates for specific columns",
//       defaultValue: {}
//     },
//     customFormatters: {
//       type: "object",
//       description: "Custom formatters for specific columns",
//       defaultValue: {}
//     },
    
//     // Footer totals props
//     enableFooterTotals: {
//       type: "boolean",
//       description: "Enable footer totals for numeric columns",
//       defaultValue: false
//     },
//     footerTotalsConfig: {
//       type: "object",
//       description: "Configuration for footer totals (showTotals, showAverages, showCounts, numberFormat, currency, precision)",
//       defaultValue: {
//         showTotals: true,
//         showAverages: false,
//         showCounts: true,
//         numberFormat: 'en-US',
//         currency: 'USD',
//         precision: 2
//       }
//     },
//     currencyColumns: {
//       type: "object",
//       description: "Array of column keys to be formatted as currency in footer totals",
//       defaultValue: []
//     },

//     // Column grouping props
//     enableColumnGrouping: {
//       type: "boolean",
//       description: "Enable column grouping functionality",
//       defaultValue: false
//     },
//     headerColumnGroup: {
//       type: "object",
//       description: "Custom header column group component",
//       defaultValue: null
//     },
//     footerColumnGroup: {
//       type: "object",
//       description: "Custom footer column group component",
//       defaultValue: null
//     },
//     columnGroups: {
//       type: "object",
//       description: "Array of column group configurations",
//       defaultValue: []
//     },
//     groupConfig: {
//       type: "object",
//       description: "Configuration for column grouping styling and behavior. Object with properties like enableHeaderGroups, enableFooterGroups, groupSeparator, ungroupedColumns, totalColumns, customGroupMappings, etc.",
//       defaultValue: {
//         enableHeaderGroups: true,
//         enableFooterGroups: true,
//         groupStyle: {},
//         headerGroupStyle: {},
//         footerGroupStyle: {},
//         groupSeparator: '__',
//         ungroupedColumns: [],
//         totalColumns: [],
//         customGroupMappings: {},
//         groupingPatterns: []
//       }
//     },

//     // Auto-merge configuration props
//     enableAutoMerge: {
//       type: "boolean",
//       description: "Enable automatic data merging for object with arrays (e.g., {service: [...], support: [...]})",
//       defaultValue: false
//     },
//     mergeConfig: {
//       type: "object",
//       description: "Configuration for auto-merge functionality. Object with properties like by, preserve, autoDetectMergeFields, mergeStrategy.",
//       defaultValue: {
//         by: [],
//         preserve: [],
//         autoDetectMergeFields: true,
//         mergeStrategy: "combine"
//       }
//     },
//     enableAutoColumnGrouping: {
//       type: "boolean",
//       description: "Enable automatic column grouping based on merged data or column patterns",
//       defaultValue: false
//     },
    
//     // Advanced filter options
//     filterDelay: {
//       type: "number",
//       description: "Delay in milliseconds before applying filter",
//       defaultValue: 300
//     },
//     globalFilterPlaceholder: {
//       type: "string",
//       description: "Placeholder text for global search input",
//       defaultValue: "Search..."
//     },
//     filterLocale: {
//       type: "string",
//       description: "Locale for filter formatting",
//       defaultValue: "en"
//     },
    
//     // Inline editing
//     enableInlineEditing: {
//       type: "boolean",
//       description: "Enable inline row editing",
//       defaultValue: false
//     },
//     editingRows: {
//       type: "object",
//       description: "Currently editing rows",
//       defaultValue: null
//     },
//     onRowEditSave: {
//       type: "eventHandler",
//       description: "Called when row edit is saved",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Row edit save event"
//         }
//       ]
//     },
//     onRowEditCancel: {
//       type: "eventHandler",
//       description: "Called when row edit is cancelled",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Row edit cancel event"
//         }
//       ]
//     },
//     onRowEditInit: {
//       type: "eventHandler",
//       description: "Called when row edit is initialized",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Row edit init event"
//         }
//       ]
//     },
//     onEditingRowsChange: {
//       type: "eventHandler",
//       description: "Called when editing rows change",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Editing rows change event"
//         }
//       ]
//     },
    
//     // Context menu
//     enableContextMenu: {
//       type: "boolean",
//       description: "Enable context menu on right-click",
//       defaultValue: false
//     },
//     contextMenu: {
//       type: "object",
//       description: "Context menu items configuration",
//       defaultValue: null
//     },
//     contextMenuSelection: {
//       type: "object",
//       description: "Currently selected context menu item",
//       defaultValue: null
//     },
//     onContextMenuSelectionChange: {
//       type: "eventHandler",
//       description: "Called when context menu selection changes",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Context menu selection change event"
//         }
//       ]
//     },
//     onContextMenu: {
//       type: "eventHandler",
//       description: "Called when context menu is triggered",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Context menu event"
//         }
//       ]
//     },
    
//     // Advanced pagination
//     showFirstLastIcon: {
//       type: "boolean",
//       description: "Show first/last page icons in pagination",
//       defaultValue: true
//     },
//     showPageLinks: {
//       type: "boolean",
//       description: "Show page number links in pagination",
//       defaultValue: true
//     },
//     showCurrentPageReport: {
//       type: "boolean",
//       description: "Show current page report in pagination",
//       defaultValue: true
//     },
//     currentPageReportTemplate: {
//       type: "string",
//       description: "Template for current page report",
//       defaultValue: "Showing {first} to {last} of {totalRecords} entries"
//     },
    
//     // Advanced export
//     exportFilename: {
//       type: "string",
//       description: "Filename for exported data",
//       defaultValue: "data"
//     },
//     exportFileType: {
//       type: "choice",
//       options: ["csv", "excel", "pdf"],
//       description: "File type for export",
//       defaultValue: "csv"
//     },
//     enableExcelExport: {
//       type: "boolean",
//       description: "Enable Excel export functionality",
//       defaultValue: false
//     },
//     enablePdfExport: {
//       type: "boolean",
//       description: "Enable PDF export functionality",
//       defaultValue: false
//     },
    
//     // Advanced selection
//     selectionMode: {
//       type: "choice",
//       options: ["single", "multiple", "checkbox"],
//       description: "Selection mode for rows",
//       defaultValue: "multiple"
//     },
//     metaKeySelection: {
//       type: "boolean",
//       description: "Enable meta key selection",
//       defaultValue: true
//     },
//     selectOnEdit: {
//       type: "boolean",
//       description: "Select row when editing",
//       defaultValue: false
//     },
    
//     // Pivot Table Props - Excel-like pivot functionality
//     enablePivotTable: {
//       type: "boolean",
//       description: "Enable Excel-like pivot table functionality",
//       defaultValue: false
//     },
    
//     // NEW: Pivot UI Configuration Props
//     enablePivotUI: {
//       type: "boolean",
//       description: "Enable pivot table configuration UI panel with dropdowns populated from data",
//       defaultValue: true
//     },
//     pivotUIPosition: {
//       type: "choice",
//       options: ["toolbar", "panel", "sidebar"],
//       description: "Position of the pivot configuration UI",
//       defaultValue: "toolbar"
//     },
    
//     // NEW: CMS Persistence Props
//     enablePivotPersistence: {
//       type: "boolean",
//       description: "Enable saving pivot configuration to CMS for persistence across refreshes",
//       defaultValue: true
//     },
//     pivotConfigKey: {
//       type: "string",
//       description: "Key for storing pivot configuration in CMS (unique identifier)",
//       defaultValue: "pivotConfig"
//     },
//     autoSavePivotConfig: {
//       type: "boolean",
//       description: "Automatically save pivot configuration changes to CMS (disable for manual save with 'Apply & Save' button)",
//       defaultValue: false
//     },
    
//     // NEW: Direct Plasmic CMS Integration Props
//     plasmicWorkspaceId: {
//       type: "string",
//       description: "Plasmic workspace ID for CMS integration (optional - uses env var if not provided)",
//       defaultValue: ""
//     },
//     plasmicTableConfigsId: {
//       type: "string",
//       description: "TableConfigs table ID for CMS integration (optional - uses env var if not provided)",
//       defaultValue: ""
//     },
//     plasmicApiToken: {
//       type: "string",
//       description: "Plasmic API token for direct CMS integration (optional - uses env var if not provided)",
//       defaultValue: ""
//     },
//     useDirectCMSIntegration: {
//       type: "boolean",
//       description: "Use direct CMS integration instead of callback props",
//       defaultValue: true
//     },
    
//     // DEPRECATED: Callback-based CMS Props (use direct integration instead)
//     onSavePivotConfig: {
//       type: "eventHandler",
//       description: "DEPRECATED: Called to save pivot configuration to CMS (use direct integration instead)",
//       argTypes: [
//         {
//           name: "configKey",
//           type: "string",
//           description: "The configuration key"
//         },
//         {
//           name: "pivotConfig",
//           type: "object",
//           description: "The pivot configuration object to save"
//         }
//       ]
//     },
//     onLoadPivotConfig: {
//       type: "eventHandler",
//       description: "DEPRECATED: Called to load pivot configuration from CMS (use direct integration instead)",
//       argTypes: [
//         {
//           name: "configKey",
//           type: "string",
//           description: "The configuration key to load"
//         }
//       ]
//     },
    
//     pivotRows: {
//       type: "object",
//       description: "Array of field names to use as row grouping (like Excel's 'Rows' area). Example: ['drName', 'salesTeam']",
//       defaultValue: []
//     },
//     pivotColumns: {
//       type: "object", 
//       description: "Array of field names to use as column headers (like Excel's 'Columns' area). Example: ['date', 'category']",
//       defaultValue: []
//     },
//     pivotValues: {
//       type: "object",
//       description: "Array of value configuration objects with field and aggregation. Example: [{ field: 'serviceAmount', aggregation: 'sum' }, { field: 'supportValue', aggregation: 'average' }]",
//       defaultValue: []
//     },
//     pivotFilters: {
//       type: "object",
//       description: "Array of field names to use as pivot filters (like Excel's 'Filters' area). Example: ['region', 'status']",
//       defaultValue: []
//     },
//     pivotShowGrandTotals: {
//       type: "boolean",
//       description: "Show grand total row in pivot table",
//       defaultValue: true
//     },
//     pivotShowRowTotals: {
//       type: "boolean",
//       description: "Show row totals column in pivot table",
//       defaultValue: true
//     },
//     pivotShowColumnTotals: {
//       type: "boolean",
//       description: "Show column totals in pivot table",
//       defaultValue: true
//     },
//     pivotShowSubTotals: {
//       type: "boolean",
//       description: "Show subtotals in pivot table",
//       defaultValue: true
//     },
//     pivotNumberFormat: {
//       type: "string",
//       description: "Number format locale for pivot table (e.g., 'en-US', 'de-DE')",
//       defaultValue: "en-US"
//     },
//     pivotCurrency: {
//       type: "string",
//       description: "Currency code for pivot table formatting (e.g., 'USD', 'EUR', 'GBP')",
//       defaultValue: "USD"
//     },
//     pivotPrecision: {
//       type: "number",
//       description: "Number of decimal places for pivot table numbers",
//       defaultValue: 2
//     },
//     pivotFieldSeparator: {
//       type: "string",
//       description: "Separator for parsing complex field names like '2025-04-01__serviceAmount'",
//       defaultValue: "__"
//     },
//     pivotSortRows: {
//       type: "boolean",
//       description: "Sort row values in pivot table",
//       defaultValue: true
//     },
//     pivotSortColumns: {
//       type: "boolean",
//       description: "Sort column values in pivot table",
//       defaultValue: true
//     },
//     pivotSortDirection: {
//       type: "choice",
//       options: ["asc", "desc"],
//       description: "Sort direction for pivot table",
//       defaultValue: "asc"
//     },
//     pivotAggregationFunctions: {
//       type: "object",
//       description: "Custom aggregation functions for pivot table. Object with function names as keys",
//       defaultValue: {}
//     },
//     
//     // Expandable Table Props
//     rowExpansionTemplate: {
//       type: "function",
//       description: "Custom template function for expanded row content. Receives row data as parameter. Example: (data) => <div>Details for {data.name}</div>",
//       defaultValue: null
//     },
//     expandedRows: {
//       type: "object",
//       description: "Object controlling which rows are expanded. Use with onRowToggle for state management. Example: { 1: true, 3: true }",
//       defaultValue: null
//     },
//     onRowToggle: {
//       type: "eventHandler",
//       description: "Callback function called when rows are expanded or collapsed. Receives event object with expanded rows data.",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Event object containing expanded rows data"
//         }
//       ]
//     }
//   },
  
//   importPath: "./components/PrimeDataTableOptimized"
// });

// Register Tag Filter Components
PLASMIC.registerComponent(TagFilterPrimeReact, {
  name: "TagFilterPrimeReact",
  displayName: "Tag Filter (PrimeReact)",
  description: "Interactive tag filter component using PrimeReact UI components with native styling",
  props: {
    // Data props
    tagList: {
      type: "object",
      description: "Static list of tags to display (fallback when not using data sources)",
      defaultValue: []
    },
    tagDataSource: {
      type: "choice",
      options: ["props", "pageData", "queryData", "cmsData"],
      description: "Data source to read tags from",
      defaultValue: "props"
    },
    tagDataPath: {
      type: "string",
      description: "Path to tags within the selected data source (e.g., 'categories.items')",
      defaultValue: ""
    },
    tagField: {
      type: "string",
      description: "Field name to extract when data source items are objects",
      defaultValue: "name"
    },
    
    // Behavior props
    multiSelect: {
      type: "boolean",
      description: "Allow multiple tag selections",
      defaultValue: true
    },
    allowDeselect: {
      type: "boolean",
      description: "Allow deselecting selected tags",
      defaultValue: true
    },
    maxSelections: {
      type: "number",
      description: "Maximum number of tags that can be selected",
      defaultValue: 10
    },
    defaultSelected: {
      type: "object",
      description: "Initially selected tags",
      defaultValue: []
    },
    stateKey: {
      type: "string",
      description: "Key used in custom event payload for state management",
      defaultValue: "selectedTags"
    },
    
    // Event handlers
    onSelectionChange: {
      type: "eventHandler",
      description: "Called when tag selection changes",
      argTypes: [
        {
          name: "selectedTags",
          type: "object",
          description: "Array of currently selected tags"
        },
        {
          name: "clickedTag",
          type: "string",
          description: "The tag that was just clicked"
        }
      ]
    },
    onTagClick: {
      type: "eventHandler",
      description: "Called when a specific tag is clicked",
      argTypes: [
        {
          name: "clickedTag",
          type: "string",
          description: "The tag that was clicked"
        },
        {
          name: "selectedTags",
          type: "object",
          description: "Array of currently selected tags"
        }
      ]
    },
    
    // Search props
    showSearch: {
      type: "boolean",
      description: "Enable search functionality for tags",
      defaultValue: true
    },
    searchPlaceholder: {
      type: "string",
      description: "Placeholder text for search input",
      defaultValue: "Search tags..."
    },
    searchDebounceMs: {
      type: "number",
      description: "Search debounce delay in milliseconds",
      defaultValue: 300
    },
    searchLabel: {
      type: "string",
      description: "Label text to display above search bar (when showSearchLabel is true)",
      defaultValue: "Search"
    },
    selectedLabel: {
      type: "string",
      description: "Label text for selected items section",
      defaultValue: "Selected"
    },
    showSearchLabel: {
      type: "boolean",
      description: "Show label above search bar",
      defaultValue: false
    },
    
    // Color props
    enableTagColors: {
      type: "boolean",
      description: "Enable automatic color generation for tags",
      defaultValue: true
    },
    colorScheme: {
      type: "choice",
      options: ["default", "rainbow", "pastel", "material"],
      description: "Color scheme for tag colors",
      defaultValue: "default"
    },
    
    // Visual props (PrimeReact specific)
    display: {
      type: "choice",
      options: ["tag", "chip", "button", "badge"],
      description: "Visual style for tags",
      defaultValue: "tag"
    },
    size: {
      type: "choice",
      options: ["small", "medium", "large"],
      description: "Size of tag elements",
      defaultValue: "medium"
    },
    severity: {
      type: "choice",
      options: ["success", "info", "warn", "danger"],
      description: "Color severity for selected tags (PrimeReact theme)",
      defaultValue: undefined
    },
    icon: {
      type: "string",
      description: "Icon name for button display mode",
      defaultValue: null
    },
    iconPos: {
      type: "choice",
      options: ["left", "right"],
      description: "Icon position for button display mode",
      defaultValue: "left"
    }
  },
  importPath: "./components/TagFilterPrimeReact"
});

// Register the Simple Button component
PLASMIC.registerComponent(SimpleButton, {
  name: "SimpleButton",
  displayName: "Simple Button",
  description: "A customizable button component with PrimeReact styling and various options",
  props: {
    label: {
      type: "string",
      description: "Button text",
      defaultValue: "Click Me"
    },
    icon: {
      type: "string",
      description: "Icon class name (e.g., 'pi pi-check', 'pi pi-user', 'pi pi-heart')",
      defaultValue: null
    },
    iconPos: {
      type: "choice",
      options: ["left", "right"],
      description: "Icon position relative to label",
      defaultValue: "left"
    },
    severity: {
      type: "choice",
      options: ["primary", "secondary", "success", "info", "warning", "danger", "help"],
      description: "Button color theme",
      defaultValue: "primary"
    },
    size: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Button size",
      defaultValue: "normal"
    },
    outlined: {
      type: "boolean",
      description: "Show as outlined button (no fill)",
      defaultValue: false
    },
    rounded: {
      type: "boolean",
      description: "Show with rounded corners",
      defaultValue: false
    },
    text: {
      type: "boolean",
      description: "Show as text-only button (no background)",
      defaultValue: false
    },
    raised: {
      type: "boolean",
      description: "Show with shadow/elevation",
      defaultValue: false
    },
    loading: {
      type: "boolean",
      description: "Show loading spinner",
      defaultValue: false
    },
    disabled: {
      type: "boolean",
      description: "Disable the button",
      defaultValue: false
    },
    tooltip: {
      type: "string",
      description: "Tooltip text to show on hover",
      defaultValue: ""
    },
    badge: {
      type: "string",
      description: "Badge value to display (e.g., '5', 'New')",
      defaultValue: null
    },
    badgeClass: {
      type: "choice",
      options: ["p-badge-danger", "p-badge-success", "p-badge-info", "p-badge-warning"],
      description: "Badge color class",
      defaultValue: "p-badge-danger"
    },
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles",
      defaultValue: {}
    },
    onClick: {
      type: "eventHandler",
      description: "Click event handler",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "The click event object"
        }
      ]
    }
  },
  importPath: "./components/SimpleButton"
});

// Register the Print Button component
PLASMIC.registerComponent(PrintButton, {
  name: "PrintButton",
  displayName: "Print Button",
  description: "A ready-made button for printing documents with smart iframe detection for Plasmic contexts",
  props: {
    label: {
      type: "string",
      description: "Button text",
      defaultValue: "Print"
    },
    icon: {
      type: "string",
      description: "Icon class name (e.g., 'pi pi-print', 'pi pi-file-export')",
      defaultValue: "pi pi-print"
    },
    iconPos: {
      type: "choice",
      options: ["left", "right"],
      description: "Icon position relative to label",
      defaultValue: "left"
    },
    severity: {
      type: "choice",
      options: ["primary", "secondary", "success", "info", "warning", "danger", "help"],
      description: "Button color theme",
      defaultValue: "primary"
    },
    size: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Button size",
      defaultValue: "normal"
    },
    outlined: {
      type: "boolean",
      description: "Show as outlined button (no fill)",
      defaultValue: false
    },
    rounded: {
      type: "boolean",
      description: "Show with rounded corners",
      defaultValue: false
    },
    text: {
      type: "boolean",
      description: "Show as text-only button (no background)",
      defaultValue: false
    },
    raised: {
      type: "boolean",
      description: "Show with shadow/elevation",
      defaultValue: false
    },
    loading: {
      type: "boolean",
      description: "Show loading spinner",
      defaultValue: false
    },
    disabled: {
      type: "boolean",
      description: "Disable the button",
      defaultValue: false
    },
    tooltip: {
      type: "string",
      description: "Tooltip text to show on hover",
      defaultValue: "Print this page"
    },
    badge: {
      type: "string",
      description: "Badge value to display (e.g., '5', 'New')",
      defaultValue: null
    },
    badgeClass: {
      type: "choice",
      options: ["p-badge-danger", "p-badge-success", "p-badge-info", "p-badge-warning"],
      description: "Badge color class",
      defaultValue: "p-badge-danger"
    },
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles",
      defaultValue: {}
    },
    parentWindowOrigin: {
      type: "string",
      description: "Origin for postMessage security (default: '*' for any origin)",
      defaultValue: "*"
    },
    onPrint: {
      type: "eventHandler",
      description: "Callback fired when print is initiated",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Print event data"
        }
      ]
    }
  },
  importPath: "./components/PrintButton"
});

// Register the Print Wrapper component
PLASMIC.registerComponent(PrintWrapper, {
  name: "PrintWrapper",
  displayName: "Print Wrapper", 
  description: "A wrapper that triggers A3 printing when any content inside is clicked. Perfect for custom icons, images, or text",
  props: {
    children: {
      type: "slot",
      description: "Content to be wrapped (icons, images, text, etc.)"
    },
    className: {
      type: "string",
      description: "Additional CSS classes for wrapper",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for wrapper",
      defaultValue: {}
    },
    cursor: {
      type: "choice",
      options: ["pointer", "default", "grab", "not-allowed"],
      description: "Cursor style for the wrapper",
      defaultValue: "pointer"
    },
    parentWindowOrigin: {
      type: "string", 
      description: "Origin for postMessage security (default: '*' for any origin)",
      defaultValue: "*"
    },
    disabled: {
      type: "boolean",
      description: "Disable the print functionality",
      defaultValue: false
    },
    tooltip: {
      type: "string",
      description: "Tooltip text to show on hover",
      defaultValue: "Click to print this page"
    },
    onPrint: {
      type: "eventHandler",
      description: "Callback fired when print is initiated",
      argTypes: [
        {
          name: "event",
          type: "object", 
          description: "Print event data"
        }
      ]
    }
  },
  importPath: "./components/PrintWrapper"
});

// Register the Simple Card component
PLASMIC.registerComponent(SimpleCard, {
  name: "SimpleCard",
  displayName: "Simple Card",
  description: "A flexible card component for displaying content with customizable header, body, and footer",
  props: {
    title: {
      type: "string",
      description: "Card header title",
      defaultValue: ""
    },
    subtitle: {
      type: "string",
      description: "Card header subtitle",
      defaultValue: ""
    },
    header: {
      type: "slot",
      description: "Custom header content (overrides title/subtitle)"
    },
    footer: {
      type: "slot",
      description: "Footer content"
    },
    children: {
      type: "slot",
      description: "Card body content"
    },
    headerImage: {
      type: "string",
      description: "URL for header image",
      defaultValue: null
    },
    headerImageAlt: {
      type: "string",
      description: "Alt text for header image",
      defaultValue: ""
    },
    headerImageHeight: {
      type: "string",
      description: "Height of header image (e.g., '200px', '150px')",
      defaultValue: "200px"
    },
    shadow: {
      type: "boolean",
      description: "Show shadow/elevation",
      defaultValue: true
    },
    bordered: {
      type: "boolean",
      description: "Show border around card",
      defaultValue: true
    },
    hoverable: {
      type: "boolean",
      description: "Enable hover effects (lift and shadow)",
      defaultValue: false
    },
    width: {
      type: "string",
      description: "Card width (e.g., '300px', '100%', 'auto')",
      defaultValue: "auto"
    },
    height: {
      type: "string",
      description: "Card height (e.g., '400px', 'auto')",
      defaultValue: "auto"
    },
    padding: {
      type: "string",
      description: "Card body padding (e.g., '1rem', '20px')",
      defaultValue: "1rem"
    },
    backgroundColor: {
      type: "string",
      description: "Background color",
      defaultValue: "#ffffff"
    },
    borderColor: {
      type: "string",
      description: "Border color",
      defaultValue: "#dee2e6"
    },
    borderRadius: {
      type: "string",
      description: "Border radius (e.g., '6px', '12px', '0')",
      defaultValue: "6px"
    },
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles",
      defaultValue: {}
    },
    onClick: {
      type: "eventHandler",
      description: "Click event handler for the entire card",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "The click event object"
        }
      ]
    }
  },
  importPath: "./components/SimpleCard"
});

// Register the Simple Skeleton component
PLASMIC.registerComponent(AdvancedSkeleton, {
  name: "SimpleSkeleton",
  displayName: "Simple Skeleton",
  description: "PrimeReact Skeleton with full shape/size controls, presets, and force rendering",
  props: {
    // Core
    loading: {
      type: "boolean",
      description: "Whether to show skeleton or content",
      defaultValue: true
    },
    children: {
      type: "slot",
      description: "Content to show when not loading"
    },
    // Force rendering
    forceRender: {
      type: "boolean",
      description: "Force skeleton to render even when not loading (for demos)",
      defaultValue: false
    },
    forceRenderDuration: {
      type: "number",
      description: "Duration in milliseconds for force rendering (0 = infinite)",
      defaultValue: 5000
    },
    // PrimeReact Skeleton API
    shape: {
      type: "choice",
      options: ["rectangle", "rounded", "square", "circle"],
      description: "Skeleton shape",
      defaultValue: "rectangle"
    },
    size: {
      type: "string",
      description: "Predefined token (small|normal|large) or CSS size like '2rem' (for square/circle)",
      defaultValue: "normal"
    },
    width: {
      type: "string",
      description: "Custom width (e.g., '200px', '100%')",
      defaultValue: null
    },
    height: {
      type: "string",
      description: "Custom height (e.g., '30px', '2rem')",
      defaultValue: null
    },
    borderRadius: {
      type: "string",
      description: "Border radius for rectangle/rounded shapes (e.g., '16px')",
      defaultValue: "16px"
    },
    animation: {
      type: "choice",
      options: ["wave", "pulse", "none"],
      description: "Animation type",
      defaultValue: "wave"
    },
    // Presets
    template: {
      type: "choice",
      options: ["", "paragraph", "text", "card", "list", "datatable", "avatar-text"],
      description: "Preset layout (leave empty for single skeleton)",
      defaultValue: ""
    },
    lines: {
      type: "number",
      description: "Number of lines/items for paragraph/list/datatable presets",
      defaultValue: 3
    },
    // Styling
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles",
      defaultValue: {}
    }
  },
  importPath: "./components/AdvancedSkeleton"
});


// Register the Static Skeleton component (no slots, fixed layout)
PLASMIC.registerComponent(StaticSkeleton, {
  name: "StaticSkeleton",
  displayName: "Static Skeleton",
  description: "Minimal static skeleton with a header, lines, and block",
  props: {
    animation: {
      type: "choice",
      options: ["wave", "pulse", "none"],
      defaultValue: "wave",
      description: "Animation type"
    },
    className: {
      type: "string",
      defaultValue: "",
      description: "Additional CSS classes"
    },
    style: {
      type: "object",
      defaultValue: {},
      description: "Inline styles"
    }
  },
  importPath: "./components/StaticSkeleton"
});


// Register minimal Rectangle Skeleton
PLASMIC.registerComponent(RectSkeleton, {
  name: "RectSkeleton",
  displayName: "Rect Skeleton",
  description: "Minimal rectangle skeleton",
  props: {
    width: { type: "string", defaultValue: "100%", description: "Width (e.g., '100%', '200px')" },
    height: { type: "string", defaultValue: "1rem", description: "Height (e.g., '1rem', '24px')" },
    borderRadius: { type: "string", defaultValue: "6px", description: "Border radius (e.g., '6px')" },
    animation: { type: "choice", options: ["wave", "pulse", "none"], defaultValue: "wave" },
    className: { type: "string", defaultValue: "" },
    style: { type: "object", defaultValue: {} }
  },
  importPath: "./components/RectSkeleton"
});

// Register minimal Circle Skeleton
PLASMIC.registerComponent(CircleSkeleton, {
  name: "CircleSkeleton",
  displayName: "Circle Skeleton",
  description: "Minimal circle skeleton",
  props: {
    size: { type: "string", defaultValue: "3rem", description: "Diameter (e.g., '3rem', '48px')" },
    animation: { type: "choice", options: ["wave", "pulse", "none"], defaultValue: "wave" },
    className: { type: "string", defaultValue: "" },
    style: { type: "object", defaultValue: {} }
  },
  importPath: "./components/CircleSkeleton"
});

// Register Raven Chat Embed component
PLASMIC.registerComponent(RavenChatEmbed, {
  name: "RavenChatEmbed",
  displayName: "🕊 Raven Chat Embed",
  description: "Embed Raven chat directly in your Plasmic app with customizable styling",
  props: {
    url: {
      type: "string",
      defaultValue: "https://erp.elbrit.org/raven",
      description: "The Raven chat URL to embed (usually same ERP endpoint)"
    },
    height: {
      type: "number",
      defaultValue: 720,
      description: "Height of the chat frame in pixels"
    },
    showBorder: {
      type: "boolean",
      defaultValue: false,
      description: "Show border around chat frame"
    },
    borderRadius: {
      type: "number",
      defaultValue: 10,
      description: "Rounded corners (in px)"
    }
  },
  importPath: "./components/RavenChatEmbed"
});

// Register PrimeReact Timeline component
PLASMIC.registerComponent(PrimeTimeline, {
  name: "PrimeTimeline",
  displayName: "PrimeReact Timeline",
  description: "PrimeReact Timeline with customizable marker/content template and optional Read more action",
  props: {
    // Data
    events: {
      type: "object",
      description: "Array of event objects to render in the timeline",
      defaultValue: []
    },

    // Field mappings
    titleField: { type: "string", defaultValue: "status", description: "Field name for the title/status" },
    dateField: { type: "string", defaultValue: "date", description: "Field name for the date" },
    descriptionField: { type: "string", defaultValue: "description", description: "Field name for the description" },
    iconField: { type: "string", defaultValue: "icon", description: "Field name for the PrimeIcons class (e.g., 'pi pi-check')" },
    markerColorField: { type: "string", defaultValue: "color", description: "Field name for marker background color" },
    linkField: { type: "string", defaultValue: "link", description: "Field name for optional link/href" },
    oppositeField: { type: "string", defaultValue: "date", description: "Field name for opposite-side content (vertical only)" },
    imageField: { type: "string", defaultValue: "", description: "Field name for image URL (optional)" },
    imageAltField: { type: "string", defaultValue: "", description: "Field name for image alt text (optional)" },

    // Layout
    align: { type: "choice", options: ["", "left", "right", "alternate"], defaultValue: "", description: "Override alignment (leave empty to use styleMode)" },
    layout: { type: "choice", options: ["", "vertical", "horizontal"], defaultValue: "", description: "Override layout (leave empty to use styleMode)" },
    styleMode: {
      type: "choice",
      options: [
        "verticalBasic",
        "verticalRight",
        "verticalOpposite",
        "verticalAlternate",
        "horizontalTop",
        "horizontalBottom",
        "horizontalAlternate"
      ],
      defaultValue: "verticalAlternate",
      description: "Preset timeline layout/styles"
    },

    // UI
    showOpposite: { type: "boolean", defaultValue: true, description: "Show date on opposite side (vertical only)" },
    showReadMore: { type: "boolean", defaultValue: true, description: "Show the Read more action button" },
    readMoreLabel: { type: "string", defaultValue: "Read more", description: "Label for the Read more button" },
    readMoreFontSize: { type: "string", defaultValue: "0.875rem", description: "Font size for Read more button text (e.g., '14px', '0.875rem', '1rem')" },
    readMorePadding: { type: "string", defaultValue: "0.25rem 0.5rem", description: "Custom padding for Read more button (e.g., '0.25rem 0.5rem', '4px 8px')" },
    readMoreStyle: { type: "object", defaultValue: {}, description: "Custom inline styles for Read more button" },
    readMoreClassName: { type: "string", defaultValue: "", description: "Custom CSS class for Read more button" },
    readMoreBorderRadius: { type: "string", defaultValue: "4px", description: "Border radius for Read more button (e.g., '4px', '8px', '50%')" },
    readMoreWidth: { type: "string", defaultValue: "auto", description: "Width of Read more button (e.g., 'auto', '100px', '100%')" },
    readMoreHeight: { type: "string", defaultValue: "auto", description: "Height of Read more button (e.g., 'auto', '32px', '2rem')" },
    showPdfButton: { type: "boolean", defaultValue: true, description: "Show the PDF view button" },
    pdfButtonLabel: { type: "string", defaultValue: "View as PDF", description: "Label for the PDF button" },
    pdfData: { type: "object", defaultValue: null, description: "Static data or function(item) -> data passed on PDF view" },
    pdfDataField: { type: "string", defaultValue: "", description: "Field path on item to pass as data when PDF button clicked" },
    pdfButtonSeverity: { type: "string", defaultValue: "primary", description: "PDF button severity (primary, secondary, success, info, warning, danger)" },
    pdfButtonSize: { type: "string", defaultValue: "small", description: "PDF button size (small, normal, large)" },
    pdfButtonStyle: { type: "object", defaultValue: { color: "#ffffff" }, description: "Custom inline styles for PDF button" },
    pdfButtonClassName: { type: "string", defaultValue: "", description: "Custom CSS class for PDF button" },
    pdfButtonPadding: { type: "string", defaultValue: "0.5rem 1rem", description: "Custom padding for PDF button (e.g., '0.5rem 1rem', '8px 16px')" },
    pdfButtonFontSize: { type: "string", defaultValue: "0.875rem", description: "Font size for PDF button text (e.g., '14px', '0.875rem', '1rem')" },
    pdfButtonBorderRadius: { type: "string", defaultValue: "6px", description: "Border radius for PDF button (e.g., '4px', '8px', '50%')" },
    pdfButtonWidth: { type: "string", defaultValue: "auto", description: "Width of PDF button (e.g., 'auto', '100px', '100%')" },
    pdfButtonHeight: { type: "string", defaultValue: "auto", description: "Height of PDF button (e.g., 'auto', '40px', '3rem')" },
    useEmptyDrawer: { type: "boolean", defaultValue: false, description: "When true, drawer content will be empty for Plasmic slot usage" },
    drawerContent: { 
      type: "slot", 
      description: "Custom content for drawer when useEmptyDrawer is true. Access data via 'currentItem' (clicked timeline item) or 'allEvents' (all timeline data)" 
    },

    // Styling
    className: { type: "string", defaultValue: "" },
    style: { type: "object", defaultValue: {} },
    containerWidth: { type: "string", defaultValue: "auto", description: "Width of the wrapper container (e.g., '100%', '600px')" },
    containerHeight: { type: "string", defaultValue: "auto", description: "Height of the wrapper container (e.g., 'auto', '480px')" },
    markerSize: { type: "number", defaultValue: 32, description: "Marker diameter in pixels" },
    markerTextColor: { type: "string", defaultValue: "#ffffff", description: "Marker icon color" },
    markerVariant: { type: "choice", options: ["icon", "dot", "none"], defaultValue: "icon", description: "Marker content variant" },
    timelineClassName: { type: "string", defaultValue: "", description: "Extra class applied to the Timeline element" },
    readMoreTarget: { type: "choice", options: ["_self", "_blank"], defaultValue: "_self", description: "Target when auto-opening link on Read more" },
    imageWidth: { type: "string", defaultValue: "100%", description: "Width of image inside item (CSS width)" },
    imagePreview: { type: "boolean", defaultValue: true, description: "Enable lightbox preview for image" },
    enableDialog: { type: "boolean", defaultValue: false, description: "Open a PrimeReact Dialog on Read more when no link" },
    dialogHeaderField: { type: "string", defaultValue: "", description: "Field for dialog header (fallbacks to title)" },
    dialogContentField: { type: "string", defaultValue: "", description: "Field for dialog body (fallbacks to description)" },
    dialogWidth: { type: "string", defaultValue: "30rem", description: "Dialog width (e.g., '30rem', '600px')" },
    dialogMode: { type: "choice", options: ["content", "twoCards", "twoTables"], defaultValue: "content", description: "Dialog layout mode" },
    displayMode: { type: "choice", options: ["dialog", "drawer"], defaultValue: "dialog", description: "Display as dialog popup or drawer" },
    drawerPosition: { type: "choice", options: ["auto", "right", "left", "top", "bottom"], defaultValue: "auto", description: "Drawer position (auto = right on desktop, bottom on mobile)" },
    drawerSize: { type: "string", defaultValue: "50rem", description: "Drawer size (width for left/right, height for top/bottom)" },
    leftCardTitle: { type: "string", defaultValue: "", description: "Left card title for twoCards mode" },
    rightCardTitle: { type: "string", defaultValue: "", description: "Right card title for twoCards mode" },
    leftFields: { type: "object", defaultValue: [], description: "Left card fields: array of {label, field} (supports dot paths)" },
    rightFields: { type: "object", defaultValue: [], description: "Right card fields: array of {label, field} (supports dot paths)" },
    columnGap: { type: "string", defaultValue: "1rem", description: "Gap between two cards" },
    dialogCardPadding: { type: "string", defaultValue: "1rem", description: "Padding inside dialog cards" },
    leftListField: { type: "string", defaultValue: "", description: "Array field for left card list (e.g., 'earnings')" },
    leftListItemLabelField: { type: "string", defaultValue: "salary_component__name", description: "Label field path for left list rows" },
    leftListItemValueField: { type: "string", defaultValue: "amount", description: "Value field path for left list rows" },
    rightListField: { type: "string", defaultValue: "", description: "Array field for right card list (e.g., 'deductions')" },
    rightListItemLabelField: { type: "string", defaultValue: "salary_component__name", description: "Label field path for right list rows" },
    rightListItemValueField: { type: "string", defaultValue: "amount", description: "Value field path for right list rows" },
    showSummary: { type: "boolean", defaultValue: false, description: "Show summary block in main timeline content" },
    summaryTitle: { type: "string", defaultValue: "Summary", description: "Title for the summary block" },
    summaryFields: { type: "object", defaultValue: [], description: "Summary fields: array of {label, field} (supports dot paths)" },
    cardWidth: { type: "string", defaultValue: "auto", description: "Width of main timeline cards (e.g., 'auto', '300px', 'fit-content')" },
    cardHeight: { type: "string", defaultValue: "auto", description: "Height of main timeline cards (e.g., 'auto', '200px', 'fit-content')" },
    cardPadding: { type: "string", defaultValue: "12px", description: "Padding inside main timeline cards" },
    cardBorderRadius: { type: "string", defaultValue: "8px", description: "Border radius of main timeline cards" },
    leftTableColumns: { type: "object", defaultValue: [], description: "Left table columns: array of {field, header, align, style, formatter}" },
    rightTableColumns: { type: "object", defaultValue: [], description: "Right table columns: array of {field, header, align, style, formatter}" },
    tableSize: { type: "choice", options: ["small", "normal", "large"], defaultValue: "small", description: "Table size for twoTables mode" },
    showTableBorders: { type: "boolean", defaultValue: true, description: "Show table borders in twoTables mode" },
    tableStripedRows: { type: "boolean", defaultValue: true, description: "Enable striped rows in twoTables mode" },
    showTableTotals: { type: "boolean", defaultValue: true, description: "Show total rows at bottom of tables" },
    leftTotalField: { type: "string", defaultValue: "gross_pay", description: "Field for left table total (e.g., 'gross_pay')" },
    leftTotalLabel: { type: "string", defaultValue: "Gross Pay", description: "Label for left table total row" },
    rightTotalField: { type: "string", defaultValue: "total_deduction", description: "Field for right table total (e.g., 'total_deduction')" },
    rightTotalLabel: { type: "string", defaultValue: "Total Deduction", description: "Label for right table total row" },
    
    // Total row colors
    leftTotalColor: { type: "string", defaultValue: "#e3f2fd", description: "Background color for gross pay total row (light blue default)" },
    leftTotalTextColor: { type: "string", defaultValue: "#1976d2", description: "Text color for gross pay total row (dark blue default)" },
    rightTotalColor: { type: "string", defaultValue: "#ffebee", description: "Background color for total deduction row (light red default)" },
    rightTotalTextColor: { type: "string", defaultValue: "#d32f2f", description: "Text color for total deduction row (dark red default)" },

    // Events
    onReadMore: {
      type: "eventHandler",
      description: "Called when the Read more action is clicked",
      argTypes: [
        { name: "item", type: "object", description: "The timeline item object" },
        { name: "href", type: "string", description: "Link from the item (if provided)" }
      ]
    },
    onPdfView: {
      type: "eventHandler",
      description: "Called when the PDF view button is clicked (no internal generation)",
      argTypes: [
        { name: "item", type: "object", description: "The timeline item object" },
        { name: "data", type: "object", description: "Data resolved from pdfData/pdfDataField" }
      ]
    },
    onItemClick: {
      type: "eventHandler",
      description: "Called when the timeline card is clicked",
      argTypes: [ { name: "item", type: "object" } ]
    },
    onImageClick: {
      type: "eventHandler",
      description: "Called when the image inside an item is clicked",
      argTypes: [ { name: "item", type: "object" }, { name: "src", type: "string" } ]
    },
    onDialogOpen: {
      type: "eventHandler",
      description: "Called right before dialog is shown (when enabledDialog is true and no link)",
      argTypes: [ { name: "item", type: "object" } ]
    }
  },
  importPath: "./components/PrimeTimeline",
  classNameProp: "className",
  defaultStyles: {},
  providesData: true
});

// Register the Novu Inbox component
PLASMIC.registerComponent(NovuInbox, {
  name: "NovuInbox",
  displayName: "Novu Inbox",
  description: "A notification inbox component for Novu that displays real-time notifications for authenticated users using their employeeId as subscriber ID",
  props: {
    applicationIdentifier: {
      type: "string",
      description: "Novu application identifier. If not provided, uses NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER from env",
      defaultValue: null
    },
    subscriberId: {
      type: "string",
      description: "Subscriber ID. If not provided, uses employeeId from AuthContext or localStorage",
      defaultValue: null
    },
    backendUrl: {
      type: "string",
      description: "Backend URL for EU region. If not provided, uses NEXT_PUBLIC_NOVU_BACKEND_URL from env",
      defaultValue: null
    },
    socketUrl: {
      type: "string",
      description: "Socket URL for EU region. If not provided, uses NEXT_PUBLIC_NOVU_SOCKET_URL from env",
      defaultValue: null
    },
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles",
      defaultValue: {}
    },
    keyless: {
      type: "boolean",
      description: "Use keyless mode for testing (temporary data, expires in 24h)",
      defaultValue: false
    }
  },
  importPath: "./components/NovuInbox"
});
