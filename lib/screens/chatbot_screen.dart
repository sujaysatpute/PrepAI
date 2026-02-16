import 'dart:async';
import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import '../services/api_service.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final TextEditingController controller = TextEditingController();
  final ScrollController scrollController = ScrollController();
  late stt.SpeechToText _speech;
  final FlutterTts _tts = FlutterTts();
  bool _isListening = false;
  bool _isTyping = false;
  String? _sessionId;
  List<Map<String, String>> chat = [];

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    WidgetsBinding.instance.addPostFrameCallback((_) => _startInterview());
  }

  void _speak(String text) async {
    await _tts.setLanguage('en-IN');
    await _tts.setPitch(1.0);
    await _tts.setSpeechRate(0.9);
    await _tts.speak(text);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (scrollController.hasClients) {
        scrollController.jumpTo(scrollController.position.maxScrollExtent);
      }
    });
  }

  Future<void> _startInterview() async {
    final args = ModalRoute.of(context)!.settings.arguments as Map?;
    final role = args?['role'] ?? '';
    final company = args?['company'] ?? '';
    if (role.toString().isEmpty || company.toString().isEmpty) return;

    setState(() => _isTyping = true);
    try {
      final data = await ApiService.startInterview(role, company);
      _sessionId = data['session_id'] as String?;
      final question =
          (data['question'] ?? 'Hello! Let’s get started — can you tell me about yourself?').toString();

      setState(() {
        chat.add({'sender': 'ai', 'text': question});
        _isTyping = false;
      });

      _speak(question);
      _scrollToBottom();
    } catch (e) {
      setState(() => _isTyping = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Failed to start interview: $e')));
    }
  }

  void _send(String text, String role, String company) async {
    if (text.trim().isEmpty) return;
    setState(() => chat.add({'sender': 'user', 'text': text}));
    controller.clear();
    setState(() => _isTyping = true);

    try {
      final sid = _sessionId;
      if (sid == null) throw Exception('Session not started');
      final res = await ApiService.sendAnswer(sid, text);

      final reply = (res['next_question'] ?? '').toString().trim();
      final feedback = (res['feedback'] ?? '').toString().trim();
      final completed = (res['completed'] ?? false) as bool;

      // Merge feedback + next question naturally
      String aiText = '';
      if (feedback.isNotEmpty && reply.isNotEmpty) {
        aiText = '$feedback Now, $reply';
      } else if (feedback.isNotEmpty) {
        aiText = feedback;
      } else if (reply.isNotEmpty) {
        aiText = reply;
      }

      // Avoid adding duplicate messages
      if (chat.isEmpty || chat.last['text'] != aiText) {
        setState(() {
          if (aiText.isNotEmpty) chat.add({'sender': 'ai', 'text': aiText});
          _isTyping = false;
        });
        if (aiText.isNotEmpty) _speak(aiText);
      } else {
        setState(() => _isTyping = false);
      }

      _scrollToBottom();

      if (completed) {
        await _endInterview(navigate: true);
      }
    } catch (e) {
      debugPrint("Error sending message: $e");
      setState(() {
        _isTyping = false;
        chat.add({'sender': 'ai', 'text': 'Error: Unable to get response.'});
      });
    }
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize();
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(onResult: (result) {
          setState(() {
            controller.text = result.recognizedWords;
          });
        });
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  Future<void> _endInterview({bool navigate = false}) async {
    final sid = _sessionId;
    if (sid == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('No active session')));
      return;
    }
    setState(() => _isTyping = true);
    try {
      final data = await ApiService.endInterview(sid);
      setState(() => _isTyping = false);
      if (navigate) {
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/summary', arguments: data);
      } else {
        if (!mounted) return;
        Navigator.pushNamed(context, '/summary', arguments: data);
      }
    } catch (e) {
      setState(() => _isTyping = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Failed to end: $e')));
    }
  }

  String _getFeedback(int score) {
    if (score >= 8) return "Excellent communication and confidence!";
    if (score >= 5) return "Good effort! Try to add more detailed answers.";
    return "Needs improvement. Focus on clarity and structure.";
  }

  @override
  void dispose() {
    _speech.stop();
    _tts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map?;
    final role = args?['role'] ?? '';
    final company = args?['company'] ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Interview'),
        actions: [
          IconButton(
            icon: const Icon(Icons.stop_circle_outlined, color: Colors.redAccent),
            tooltip: 'End Interview',
            onPressed: _endInterview,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: scrollController,
              itemCount: chat.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isTyping && index == chat.length) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin:
                          const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade800,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2)),
                          SizedBox(width: 8),
                          Text('Thinking...',
                              style: TextStyle(color: Colors.white70))
                        ],
                      ),
                    ),
                  );
                }
                final m = chat[index];
                final isUser = m['sender'] == 'user';
                return Row(
                  mainAxisAlignment:
                      isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!isUser)
                      const Padding(
                        padding: EdgeInsets.only(left: 8.0, top: 8),
                        child: CircleAvatar(
                            radius: 12, child: Icon(Icons.smart_toy, size: 14)),
                      ),
                    Flexible(
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                            vertical: 6, horizontal: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isUser
                              ? Colors.teal.shade400
                              : Colors.grey.shade800,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          m['text'] ?? '',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                    if (isUser)
                      const Padding(
                        padding: EdgeInsets.only(right: 8.0, top: 8),
                        child: CircleAvatar(
                            radius: 12, child: Icon(Icons.person, size: 14)),
                      ),
                  ],
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(_isListening ? Icons.mic_off : Icons.mic),
                  onPressed: _listen,
                ),
                Expanded(
                  child: TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                        hintText: 'Type or speak your answer'),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () => _send(controller.text, role, company),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
