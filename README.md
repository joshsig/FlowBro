# FlowBro - Period Tracking & Partner Support App

FlowBro is a thoughtful period tracking app designed for partners who want to support their loved ones during their menstrual cycle. The app provides period tracking functionality with intelligent partner notifications to help partners be more understanding and supportive.

## Features

### 🩸 Period Tracking
- **Cycle Prediction**: Intelligent cycle prediction based on historical data
- **Calendar View**: Visual calendar showing period dates, ovulation, and PMS periods
- **Symptom Tracking**: Track symptoms like cramps, bloating, mood swings, etc.
- **Flow Intensity**: Record light, medium, or heavy flow
- **Notes**: Add personal notes for each period entry

### 💕 Partner Notifications
- **Smart Reminders**: Get notified 1-7 days before period starts
- **Customizable Messages**: Set personalized reminder messages
- **Multiple Notification Types**:
  - Period start reminders
  - Ovulation notifications
  - PMS period alerts
  - Period end notifications
- **Partner Name**: Personalize notifications with partner's name

### 📱 Modern UI
- **Beautiful Design**: Clean, modern interface with thoughtful color coding
- **Dark/Light Mode**: Automatic theme switching
- **Intuitive Navigation**: Easy-to-use tab-based navigation
- **Visual Indicators**: Color-coded calendar with legend

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FlowBro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## App Structure

### Screens
- **Home**: Overview of current cycle status, days until next period, and key information
- **Tracking**: Calendar view and period entry form
- **Settings**: Partner notification configuration and app settings

### Key Components
- `PeriodCalendar`: Interactive calendar with period visualization
- `PeriodEntryForm`: Form for adding new period entries
- `PartnerSettings`: Configuration for partner notifications

### Services
- `PeriodTrackingService`: Core period tracking logic and predictions
- `NotificationService`: Push notification management
- `StorageService`: Local data persistence with AsyncStorage

## Usage

### Setting Up Partner Notifications

1. Go to the **Settings** tab
2. Enable "Partner Notifications"
3. Enter your partner's name
4. Choose reminder days (1-7 days before period)
5. Select notification types (period start, ovulation, PMS, etc.)
6. Customize messages or use default ones
7. Save settings

### Adding Period Entries

1. Go to the **Tracking** tab
2. Tap "Add Period Entry" or select a date on the calendar
3. Set start and end dates
4. Choose flow intensity
5. Select symptoms
6. Add optional notes
7. Save entry

### Understanding the Calendar

- **Pink**: Actual period days
- **Light Pink (Dashed)**: Predicted period days
- **Gold Border**: Ovulation window
- **Orange Border**: PMS period

## Technical Details

### Dependencies
- **Expo**: Cross-platform development framework
- **React Native**: Mobile app development
- **TypeScript**: Type-safe JavaScript
- **AsyncStorage**: Local data persistence
- **Expo Notifications**: Push notification system
- **React Native Calendars**: Calendar component
- **Date-fns**: Date manipulation library

### Data Storage
All data is stored locally on the device using AsyncStorage. No data is sent to external servers, ensuring complete privacy.

### Notifications
The app uses Expo's notification system to send local push notifications. Notifications are scheduled based on cycle predictions and user preferences.

## Privacy & Security

- **Local Storage**: All data stays on your device
- **No Cloud Sync**: No data is transmitted to external servers
- **User Control**: Complete control over notification settings
- **Data Ownership**: You own and control all your data

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**FlowBro** - Supporting partners through every cycle 💕


```
components/
├── index.ts                    # Main export file
├── forms/                      # Form components
│   ├── index.ts
│   ├── PartnerSettings.tsx
│   └── PeriodEntryForm.tsx
├── modals/                     # Modal components  
│   ├── index.ts
│   ├── EntryListModal.tsx
│   └── PeriodEntryModal.tsx
├── period/                     # Period-related components
│   ├── index.ts
│   ├── PeriodCalendar.tsx
│   ├── PeriodEntryList.tsx
│   └── SimpleEntryList.tsx
├── layout/                     # Layout and UI components
│   ├── index.ts
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── feedback/                   # Feedback components
│   ├── index.ts
│   └── Toast.tsx
└── ui/                         # Platform-specific UI components
    ├── IconSymbol.ios.tsx
    ├── IconSymbol.tsx
    ├── TabBarBackground.ios.tsx
    └── TabBarBackground.tsx
```