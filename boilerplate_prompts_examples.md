# 🚀 Prompt Template & Examples for Extending React Native Expo Supabase Boilerplate

This document contains:
- A **generic prompt template** for adding new features to your existing boilerplate.
- **Ready-to-use prompt examples** for common app functionalities.

---

## 📌 Generic Prompt Template

```
You are an expert in React Native + Expo + TypeScript + Supabase.  
We already have a boilerplate project with:
- Expo SDK (latest stable) + TypeScript
- Supabase client in `src/services/supabase.ts`
- AuthContext for login/signup/session
- Navigation with AuthStack, AppTabs
- i18n (EN/FR) with `react-i18next`
- SplashScreen, WelcomeScreen
- Media utilities (CameraPicker, GalleryPicker, DocumentPicker, SupabaseUploader, FilePreview)

Your task:
Add a new feature: [DESCRIBE FEATURE CLEARLY HERE].

Requirements:
1. Describe the exact files to create or update.
2. Use TypeScript and follow the existing folder structure (`src/screens`, `src/components`, `src/services`, etc.).
3. Use Supabase for database/storage if needed.
4. Integrate i18n for all text labels (English/French).
5. If the feature needs navigation, update the navigator accordingly.
6. Ensure UI is styled consistently with the rest of the app (use [react-native-paper OR nativewind], depending on boilerplate choice).
7. Add necessary validations and error handling.
8. Add example usage in an existing screen or navigation entry.
9. Include any new `.env` variables in `.env.example`.
10. Write comments in English.

Output:
- Updated/created files with full code.
- Short explanation of how to test this new feature in the app.
```

---

## 💡 Prompt Examples for Common Features

### 1️⃣ User Profile Management
```
Add a profile screen where authenticated users can:
- View and edit their profile picture (upload to Supabase Storage).
- Edit their name, bio, and language preference.
- Save changes to Supabase `profiles` table.
```

### 2️⃣ Push Notifications
```
Add push notifications using Expo Notifications:
- Request permission on first app launch.
- Store Expo Push Token in Supabase for each user.
- Create a test button to send a notification to yourself.
```

### 3️⃣ Real-Time Chat
```
Add 1-to-1 real-time chat:
- Supabase table `messages` with sender_id, receiver_id, content, created_at.
- Chat list screen + individual chat screen.
- Live updates using Supabase Realtime.
```

### 4️⃣ Favorites / Likes
```
Add a favorites system:
- Table `favorites` with user_id and item_id.
- Button to add/remove favorite.
- Screen to list all favorites for logged-in user.
```

### 5️⃣ Payments with Stripe
```
Integrate Stripe Checkout:
- Serverless function to create payment session.
- Frontend screen to trigger payment.
- Store transaction details in Supabase.
```

### 6️⃣ Offline Mode
```
Add offline detection:
- Use @react-native-community/netinfo.
- Show banner when offline.
- Queue actions and sync when back online.
```

### 7️⃣ File Management
```
Add file management screen:
- Pick document/image/video.
- Upload to Supabase Storage with progress bar.
- List and preview uploaded files.
```

### 8️⃣ Search & Filters
```
Add search and filter functionality to items list:
- Search bar to filter items by name.
- Dropdown filters (category, price range, etc.).
- Query Supabase with filters applied.
```

### 9️⃣ Multi-Step Form
```
Add multi-step onboarding form:
- Step 1: Personal details
- Step 2: Preferences
- Step 3: Confirmation
- Save data to Supabase after final step.
```

### 🔟 Dark Mode
```
Add dark mode toggle:
- Use nativewind or react-native-paper theming.
- Save preference to AsyncStorage.
- Apply theme globally.
```

---

## ✅ How to Use
1. Copy the **Generic Prompt Template**.
2. Replace `[DESCRIBE FEATURE CLEARLY HERE]` with one of the examples above (or your own idea).
3. Paste into Cursor AI and let it generate the code based on your boilerplate.

Prompt template – Cas avec création de tables/buckets
You are an expert in React Native + Expo + TypeScript + Supabase.  
We already have a boilerplate project with:  
- Expo SDK (latest stable) + TypeScript  
- Supabase client in `src/services/supabase.ts`  
- AuthContext, navigation, i18n, splash, welcome, media utilities  

Your task:  
Add a new feature: [FEATURE DESCRIPTION].  

First:  
1. Define and create any necessary Supabase tables, buckets, and Row Level Security policies.  
2. Provide SQL or Supabase CLI commands for these.  
3. Explain how to apply them in Supabase dashboard.  

Then:  
1. Update the React Native project to implement this feature using the new Supabase structure.  
2. Use TypeScript and existing folder structure.  
3. Integrate i18n for text.  
4. Handle validations and errors.  
5. Output updated/created files with comments in English.  



You are an expert in React Native + Expo + TypeScript + Supabase.  
We already have a boilerplate project with:  
[boilerplate features]  

The required Supabase structure already exists:  
- Table(s): [TABLE NAME + DESCRIPTION]  
- Bucket(s): [BUCKET NAME + DESCRIPTION]  

Do NOT recreate or modify these tables/buckets.  
Just implement the new feature using the existing structure.

Requirements:  
1. Use the provided table/bucket as-is.  
2. Fetch, insert, and update data according to the existing schema.  
3. Update the React Native project in `src/` accordingly.  
4. Use TypeScript, i18n, error handling.  
5. Follow existing UI style (nativewind or react-native-paper).  
6. Output updated/created files with comments in English.  
