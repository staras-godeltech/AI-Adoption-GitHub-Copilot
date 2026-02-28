# Customer User Guide

Welcome to the **Cosmetology Booking App**! This guide walks you through everything you need to know as a customer — from creating your account to managing your appointments.

---

## Table of Contents

1. [Getting Started](#getting-started)
   - [Register an Account](#register-an-account)
   - [Log In](#log-in)
2. [Browsing Services](#browsing-services)
   - [View Available Services](#view-available-services)
   - [View Service Details](#view-service-details)
3. [Booking an Appointment](#booking-an-appointment)
   - [Step 1: Select a Service](#step-1-select-a-service)
   - [Step 2: Choose a Date and Time](#step-2-choose-a-date-and-time)
   - [Step 3: Confirm Your Booking](#step-3-confirm-your-booking)
4. [Managing Your Appointments](#managing-your-appointments)
   - [View Your Appointments](#view-your-appointments)
   - [Cancel an Appointment](#cancel-an-appointment)
5. [FAQ](#faq)

---

## Getting Started

### Register an Account

1. Navigate to the app at `http://localhost:5173` (or the deployed URL).
2. Click **Register** in the navigation bar.
3. Fill in the registration form:
   - **First Name** and **Last Name**
   - **Email Address** — this will be your login username
   - **Password** — must be at least 8 characters with one uppercase letter, one digit, and one special character
4. Click **Create Account**.
5. You will be redirected to the home page and logged in automatically.

> **Note:** Accounts created via the registration form are assigned the **Customer** role. Admin accounts are created separately by the system administrator.

---

### Log In

1. Click **Login** in the navigation bar.
2. Enter your **Email** and **Password**.
3. Click **Sign In**.
4. You will be redirected to your dashboard upon successful login.

If you forgot your password, please contact the administrator.

---

## Browsing Services

### View Available Services

1. Click **Services** in the navigation bar.
2. All active services are displayed with:
   - Service name and description
   - Duration (in minutes)
   - Price
3. Use the search box to filter services by name or description.

---

### View Service Details

1. From the Services page, click on any service card.
2. The service detail page shows:
   - Full description
   - Duration and price
   - A **Book Appointment** button

---

## Booking an Appointment

### Step 1: Select a Service

1. Go to the **Services** page.
2. Click **Book Now** on the service you want, or click the service name to view details and then click **Book Appointment**.

---

### Step 2: Choose a Date and Time

1. On the booking page, use the **date picker** to select your preferred date.
   - Only future dates are selectable.
   - Dates more than 60 days in advance may not be available.
2. Once you select a date, available **time slots** will appear.
   - Time slots are shown in 30-minute intervals during business hours (9:00 AM – 6:00 PM).
   - Slots that are already booked are grayed out and cannot be selected.
3. Click on an available time slot to select it.

---

### Step 3: Confirm Your Booking

1. Review your booking details:
   - **Service**: The selected service and its duration
   - **Date and Time**: Your chosen appointment time
   - **Price**: The cost of the service
2. Optionally, add a **note** for the cosmetologist (e.g., special requests or preferences).
3. Click **Confirm Booking**.
4. A success message will appear, and your appointment will be listed under **My Appointments** with status **Pending**.

> **Note:** Your appointment starts as **Pending** until the cosmetologist confirms it. You will see the status update in your appointments list.

---

## Managing Your Appointments

### View Your Appointments

1. Click **My Appointments** in the navigation bar (you must be logged in).
2. All your appointments are displayed with:
   - Service name
   - Date and time
   - Status (Pending, Confirmed, Cancelled, Completed)
3. Appointments are sorted with the most recent first.

**Appointment Statuses:**

| Status | Meaning |
|--------|---------|
| Pending | Waiting for cosmetologist confirmation |
| Confirmed | Approved by the cosmetologist |
| Cancelled | Cancelled (by you or the admin) |
| Completed | The appointment has taken place |

---

### Cancel an Appointment

You can cancel an appointment that has not yet been completed.

1. Go to **My Appointments**.
2. Find the appointment you wish to cancel.
3. Click the **Cancel** button next to the appointment.
4. A confirmation dialog will appear. Click **Yes, Cancel** to proceed.
5. The appointment status will change to **Cancelled**.

> **Important:** You cannot cancel a **Completed** appointment. If you need to make changes to a **Confirmed** appointment, please contact the administrator.

---

## FAQ

**Q: Can I book multiple appointments at the same time?**
A: No. Each appointment occupies a specific time slot. You can book multiple appointments at different times.

**Q: How far in advance can I book?**
A: You can book appointments up to 60 days in advance.

**Q: What happens if I don't receive a confirmation?**
A: Your appointment will show as **Pending** until the cosmetologist reviews it. If it remains Pending for an extended time, please contact the salon directly.

**Q: Can I change the date or time of my appointment?**
A: Currently, rescheduling is not supported. Please cancel your existing appointment and create a new one.

**Q: What is the cancellation policy?**
A: You can cancel any appointment that is not yet **Completed**. Please cancel as early as possible to allow others to book the time slot.

**Q: I forgot my password. What should I do?**
A: Please contact the administrator at the salon to reset your password.

**Q: Are my payment details stored?**
A: This application does not process payments. Payment is handled in person at the salon.

---

*For additional support, please contact the salon directly or email the administrator.*
