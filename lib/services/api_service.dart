import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart'
    show kIsWeb; // Only import kIsWeb, not Platform (not available on web)

class ApiService {
  // Determine base URL based on platform
  // For web (Chrome): use localhost (better for CORS)
  // For Android emulator: use 10.0.2.2
  // For iOS simulator: use localhost
  static String get base {
    if (kIsWeb) {
      // Flutter web - use localhost for better CORS compatibility
      return 'http://localhost:8000';
    } else {
      // For mobile platforms, use platform-specific detection
      // Android emulator: 10.0.2.2
      // iOS simulator: localhost
      // Default to localhost for now; can be enhanced with platform detection if needed
      return 'http://localhost:8000';
    }
  }

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
      };

  static Future<Map<String, dynamic>> startInterview(
      String role, String company) async {
    try {
      final uri = Uri.parse('$base/chat/start');
      final res = await http
          .post(uri, headers: _headers, body: jsonEncode({
            'job_role': role,
            'company': company,
          }))
          .timeout(const Duration(seconds: 20));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
      throw Exception('Start failed (${res.statusCode}): ${res.body}');
    } catch (e) {
      // Improve error handling with more context
      throw Exception('Failed to start interview: $e');
    }
  }

  static Future<Map<String, dynamic>> sendAnswer(
      String sessionId, String answer) async {
    try {
      final uri = Uri.parse('$base/chat/answer');
      final res = await http
          .post(uri, headers: _headers, body: jsonEncode({
            'session_id': sessionId,
            'answer': answer,
          }))
          .timeout(const Duration(seconds: 30));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
      throw Exception('Answer failed (${res.statusCode}): ${res.body}');
    } catch (e) {
      // Improve error handling with more context
      throw Exception('Failed to send answer: $e');
    }
  }

  static Future<Map<String, dynamic>> endInterview(String sessionId) async {
    try {
      final uri = Uri.parse('$base/chat/end');
      final res = await http
          .post(uri, headers: _headers, body: jsonEncode({
            'session_id': sessionId,
          }))
          .timeout(const Duration(seconds: 20));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
      throw Exception('End failed (${res.statusCode}): ${res.body}');
    } catch (e) {
      // Improve error handling with more context
      throw Exception('Failed to end interview: $e');
    }
  }

  // Simple stub to satisfy existing login flow; replace with real auth as needed
  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    // Simulate a successful login regardless of input for now
    return {'message': 'Login successful', 'email': email};
  }
}
