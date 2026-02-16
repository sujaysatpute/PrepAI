import 'package:flutter/material.dart';

class CompanyScreen extends StatelessWidget {
  const CompanyScreen({super.key});

  final List<String> companies = const ['Google','TCS','Infosys','Amazon','Microsoft','Apple','Meta','Nvidia','Tesla','Netflix'];

  @override
  Widget build(BuildContext context) {
    final role = ModalRoute.of(context)!.settings.arguments as String? ?? '';
    final width = MediaQuery.of(context).size.width;
    final cross = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
    return Scaffold(
      appBar: AppBar(title: const Text('Choose Company')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: GridView.builder(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: cross,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
          ),
          itemCount: companies.length,
          itemBuilder: (context, index) {
            final c = companies[index];
            return Material(
              color: const Color(0xFF162036),
              borderRadius: BorderRadius.circular(14),
              child: InkWell(
                borderRadius: BorderRadius.circular(14),
                onTap: () => Navigator.pushNamed(context, '/chatbot', arguments: {'role': role, 'company': c}),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.network('https://logo.clearbit.com/${c.replaceAll(' ', '').toLowerCase()}.com', height: 48, errorBuilder: (context,_,__) => const Icon(Icons.business, size:48)),
                      const SizedBox(height:8),
                      Text(c, style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
