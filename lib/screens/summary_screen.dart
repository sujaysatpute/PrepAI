import 'package:flutter/material.dart';

class SummaryScreen extends StatelessWidget {
  const SummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final Map<String,dynamic>? args = ModalRoute.of(context)!.settings.arguments as Map<String,dynamic>?;
    final int score = args?['score'] ?? 85;
    final int clarity = args?['clarity'] ?? 80;
    final int confidence = args?['confidence'] ?? 90;
    final String strengths = args?['strengths'] ?? 'Clear articulation, Strong STAR method usage.';
    final String improvements = args?['improvements'] ?? 'More concise answers.';
    final String suggestions = args?['suggestions'] ?? "Practice a 2-minute 'Tell me about yourself' pitch.";

    return Scaffold(
      appBar: AppBar(title: const Text('Interview Summary')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    SizedBox(
                      width: 120,
                      height: 120,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          CircularProgressIndicator(value: score/100, strokeWidth: 10),
                          Text('$score', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Clarity'),
                          const SizedBox(height: 4),
                          LinearProgressIndicator(value: clarity/100),
                          const SizedBox(height: 12),
                          const Text('Confidence'),
                          const SizedBox(height: 4),
                          LinearProgressIndicator(value: confidence/100),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: [
                  Card(child: Padding(padding: const EdgeInsets.all(12.0), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Strengths', style: TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text(strengths)]))),
                  Card(child: Padding(padding: const EdgeInsets.all(12.0), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Areas for Improvement', style: TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text(improvements)]))),
                  Card(child: Padding(padding: const EdgeInsets.all(12.0), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('AI Suggestions', style: TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 8), Text(suggestions)]))),
                ],
              ),
            ),
            Row(
              children: [
                Expanded(child: ElevatedButton(onPressed: () => Navigator.pushReplacementNamed(context, '/job-role'), child: const Text('Retry Interview'))),
                const SizedBox(width: 12),
                Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Back to Dashboard'))),
              ],
            )
          ],
        ),
      ),
    );
  }
}
