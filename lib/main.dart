import 'package:flutter/material.dart';
import 'services/test_backend_connection.dart';
import 'screens/login_screen.dart';
import 'screens/welcome_screen.dart';
import 'screens/job_role_screen.dart';
import 'screens/company_screen.dart';
import 'screens/chatbot_screen.dart';
import 'screens/summary_screen.dart';

void main() {
  // Fire-and-forget backend connectivity test; remove after verification
  // This does not block app startup
  // ignore: discarded_futures
  testBackend();
  runApp(const PrepAIApp());
}

class PrepAIApp extends StatelessWidget {
  const PrepAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xFF0EA5E9);
    final colorScheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.dark,
    );

    final theme = ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: const Color(0xFF0B1220),
      appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF121A2A),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF101826),
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      pageTransitionsTheme: const PageTransitionsTheme(builders: {
        TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
        TargetPlatform.iOS: FadeUpwardsPageTransitionsBuilder(),
        TargetPlatform.macOS: FadeUpwardsPageTransitionsBuilder(),
        TargetPlatform.windows: FadeUpwardsPageTransitionsBuilder(),
        TargetPlatform.linux: FadeUpwardsPageTransitionsBuilder(),
      }),
    );

    return MaterialApp(
      title: 'PrepAI',
      debugShowCheckedModeBanner: false,
      theme: theme,
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/welcome': (context) => const WelcomeScreen(),
        '/job-role': (context) => const JobRoleScreen(),
        '/company': (context) => const CompanyScreen(),
        '/chatbot': (context) => const ChatbotScreen(),
        '/summary': (context) => const SummaryScreen(),
      },
    );
  }
}
