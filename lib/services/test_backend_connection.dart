import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> testBackend() async {
  const baseUrl = 'http://127.0.0.1:8000/chat';

  try {
    final startRes = await http.post(
      Uri.parse('$baseUrl/start'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'job_role': 'Software Engineer', 'company': 'Google'}),
    );
    // Print raw response
    // ignore: avoid_print
    print('Start Interview: ${startRes.body}');

    final sessionId = jsonDecode(startRes.body)['session_id'];

    final answerRes = await http.post(
      Uri.parse('$baseUrl/answer'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'session_id': sessionId, 'answer': 'I am an engineer'}),
    );
    // ignore: avoid_print
    print('Next Question: ${answerRes.body}');

    final endRes = await http.post(
      Uri.parse('$baseUrl/end'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'session_id': sessionId}),
    );
    // ignore: avoid_print
    print('Interview Summary: ${endRes.body}');
  } catch (e) {
    // ignore: avoid_print
    print('Backend test failed: $e');
  }
}
















