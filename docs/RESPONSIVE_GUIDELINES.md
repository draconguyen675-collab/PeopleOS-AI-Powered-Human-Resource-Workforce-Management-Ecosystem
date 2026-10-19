# Responsive guidelines

Required widths: 320, 375, 390, 768, 1024, 1280, 1440, 1920 pixels. Browser tests visit every implemented application screen at each width and assert no horizontal document overflow.

- Desktop: fixed sidebar, two-column dashboard, four KPI cards, full directory table.
- Below 1024: Radix drawer navigation and a full-width workspace.
- Below 768: two KPI columns, stacked panels, directory cards, stacked page headings and compact account header.
- Below 390: single-column form fields/quick links and reduced outer padding.

All grids use `minmax(0, …)` and tables own any deliberate horizontal scrolling. Drawer controls have accessible names, trap focus and restore it when closed. Browser tests check Escape and focus restoration. Validate forms and destructive/approval flows at mobile width when those features are introduced. Chart descriptions must remain accessible even when axis labels are condensed.
