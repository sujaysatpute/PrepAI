import 'package:flutter/material.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  double _opacity = 0;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 100), () => setState(() => _opacity = 1));
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 600;
    return Scaffold(
      appBar: AppBar(title: const Text('Welcome')),
      body: SafeArea(
        child: AnimatedOpacity(
          opacity: _opacity,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOut,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 720),
                child: Column(
                  children: [
                    const SizedBox(height: 24),
                    CircleAvatar(radius: isWide ? 56 : 48, backgroundImage: const NetworkImage('https://i.pravatar.cc/150')),
                    const SizedBox(height: 12),
                    const Text('User', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    const Text('Confidence: 78%'),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: () => Navigator.pushNamed(context, '/job-role'),
                      child: const Text('Start Interview'),
                    ),
                    const SizedBox(height: 20),
                    NavigationBar(
                      selectedIndex: 0,
                      destinations: const [
                        NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
                        NavigationDestination(icon: Icon(Icons.history), label: 'Past'),
                        NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'Settings'),
                      ],
                    )
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
