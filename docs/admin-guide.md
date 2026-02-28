# Admin / Cosmetologist Guide

This guide is for administrators and cosmetologists who manage the Cosmetology Booking App. It covers logging in, managing services, handling appointments, and using all admin features.

---

## Table of Contents

1. [Logging In as Admin](#logging-in-as-admin)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Managing Services](#managing-services)
   - [View All Services](#view-all-services)
   - [Create a New Service](#create-a-new-service)
   - [Edit a Service](#edit-a-service)
   - [Deactivate a Service](#deactivate-a-service)
4. [Managing Appointments](#managing-appointments)
   - [View All Appointments](#view-all-appointments)
   - [Filter Appointments](#filter-appointments)
   - [Update Appointment Status](#update-appointment-status)
   - [Bulk Actions](#bulk-actions)
5. [Calendar View](#calendar-view)
6. [Export Appointments to CSV](#export-appointments-to-csv)
7. [Tips and Best Practices](#tips-and-best-practices)

---

## Logging In as Admin

Admin accounts are pre-configured by the system. Use your admin credentials on the login page.

**Default admin credentials** (change these in production!):
- **Email:** `admin@cosmetology.com`
- **Password:** `Admin123!`

1. Navigate to the app and click **Login**.
2. Enter your admin email and password.
3. Click **Sign In**.
4. You will be redirected to the **Admin Dashboard**.

The navigation bar will show admin-specific links: **Services** (manage), **Appointments**, and **Dashboard**.

---

## Admin Dashboard Overview

The **Admin Dashboard** provides a high-level view of the business:

- **Total Appointments**: Overall count across all statuses
- **Pending Appointments**: Appointments waiting for confirmation
- **Confirmed Appointments**: Appointments ready to go
- **Revenue Summary**: Based on completed appointments and service prices
- **Recent Appointments**: Quick list of the latest bookings

From the dashboard, you can navigate directly to the appointments management page or service management page.

---

## Managing Services

### View All Services

1. Click **Services** (or **Manage Services**) in the admin navigation.
2. All services are listed — both active and deactivated.
3. Each service card shows:
   - Name and description
   - Duration and price
   - Active/Inactive status

---

### Create a New Service

1. On the **Manage Services** page, click **Add New Service**.
2. Fill in the form:
   - **Name**: A clear, descriptive service name (e.g., "Classic Manicure")
   - **Description**: Details about what the service includes
   - **Duration (minutes)**: How long the service takes (e.g., 60)
   - **Price**: Cost in your currency (e.g., 45.00)
3. Click **Save Service**.
4. The new service will immediately appear in the services list for customers.

---

### Edit a Service

1. Find the service in the **Manage Services** list.
2. Click the **Edit** (pencil) button on the service card.
3. Modify any fields as needed:
   - Name, Description, Duration, Price
4. Click **Save Changes**.

> **Note:** Editing a service does not affect existing appointments that use this service. Only future bookings will reflect the changes.

---

### Deactivate a Service

If you no longer offer a service, deactivate it instead of deleting it (to preserve appointment history).

1. Find the service in the **Manage Services** list.
2. Click the **Deactivate** button.
3. A confirmation dialog will appear. Click **Confirm**.
4. The service will be marked as **Inactive** and will no longer appear on the customer-facing services page.

To **reactivate** a service:
1. Find the inactive service in the list (inactive services are shown with a grayed-out style).
2. Click the **Activate** button.

---

## Managing Appointments

### View All Appointments

1. Click **Appointments** in the admin navigation.
2. All appointments across all customers are listed with:
   - Customer name and email
   - Service name
   - Appointment date and time
   - Status (Pending, Confirmed, Cancelled, Completed)
   - Price

---

### Filter Appointments

Use the filter options at the top of the appointments list:

- **Status Filter**: Show only appointments with a specific status (All, Pending, Confirmed, Cancelled, Completed)
- **Date Range**: Filter by start and end dates
- **Search**: Search by customer name or email

Filters can be combined. Click **Clear Filters** to reset.

---

### Update Appointment Status

1. Find the appointment in the list.
2. Click the **status badge** or the **action button** (e.g., Confirm, Complete, Cancel).
3. Alternatively, click the three-dot menu (⋮) on the appointment and select the new status.

**Status transition flow:**

```
Pending → Confirmed → Completed
   ↓           ↓
Cancelled   Cancelled
```

| Current Status | Allowed Transitions |
|---------------|---------------------|
| Pending | Confirmed, Cancelled |
| Confirmed | Completed, Cancelled |
| Cancelled | (none — final) |
| Completed | (none — final) |

4. The status change is saved immediately and the customer can see the updated status.

---

### Bulk Actions

To update multiple appointments at once:

1. Check the **checkboxes** next to the appointments you want to update.
2. Use the **Bulk Actions** dropdown that appears at the top of the list.
3. Select an action:
   - **Confirm Selected**
   - **Cancel Selected**
   - **Mark as Completed**
4. Click **Apply** and confirm in the dialog.

> **Tip:** Use the header checkbox to select/deselect all visible appointments.

---

## Calendar View

The calendar provides a visual overview of all appointments.

1. Click the **Calendar** tab or button on the Appointments page.
2. The calendar displays appointments in **month**, **week**, or **day** view.
3. Click any appointment on the calendar to view its details.
4. Use the navigation arrows to move between periods.

Color coding:
- **Blue**: Pending
- **Green**: Confirmed
- **Gray**: Cancelled
- **Purple**: Completed

---

## Export Appointments to CSV

1. Go to the **Appointments** page.
2. Apply any filters you want (the export respects active filters).
3. Click the **Export to CSV** button.
4. A CSV file will be downloaded with columns:
   - ID, Customer Name, Customer Email, Service, Date, Time, Duration, Price, Status, Notes, Created At

The CSV can be opened in Excel, Google Sheets, or any spreadsheet application for reporting and analysis.

---

## Tips and Best Practices

1. **Confirm appointments promptly**: Customers see their bookings as "Pending" until you confirm. Aim to confirm or respond within 24 hours.

2. **Deactivate rather than delete**: When removing a service, always deactivate it — this preserves the history of past appointments.

3. **Use the calendar view for scheduling**: The calendar gives you a clear picture of your availability and prevents overbooking.

4. **Export regularly**: Export your appointments monthly for record-keeping and revenue tracking.

5. **Keep the service list up to date**: Ensure service prices, durations, and descriptions accurately reflect your current offerings.

6. **Check for pending appointments daily**: Make it a habit to review the admin dashboard each morning for any new pending bookings.

---

*For technical support or to reset admin credentials, contact your system administrator.*
