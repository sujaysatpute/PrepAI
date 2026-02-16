import 'package:flutter/material.dart';

class JobRoleScreen extends StatelessWidget {
  const JobRoleScreen({super.key});

  final List<Map<String, dynamic>> roles = const [
    {'title': 'Software Developer', 'icon': Icons.code},
    {'title': 'Data Analyst', 'icon': Icons.bar_chart},
    {'title': 'Cloud Architect', 'icon': Icons.cloud},
    {'title': 'HR Executive', 'icon': Icons.group},
    {'title': 'Product Manager', 'icon': Icons.inventory_2},
    {'title': 'UX/UI Designer', 'icon': Icons.palette},
    {'title': 'Marketing Specialist', 'icon': Icons.campaign},
    {'title': 'Financial Analyst', 'icon': Icons.attach_money},
  ];

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
    return Scaffold(
      appBar: AppBar(title: const Text('Select Your Role')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            TextField(decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: 'Search for a job role...')),
            const SizedBox(height: 12),
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxisCount,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.1,
                ),
                itemCount: roles.length,
                itemBuilder: (context, index) {
                  final r = roles[index];
                  return Material(
                    color: const Color(0xFF112240),
                    borderRadius: BorderRadius.circular(14),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(14),
                      onTap: () => Navigator.pushNamed(context, '/company', arguments: r['title']),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(r['icon'], size: 36, color: Theme.of(context).colorScheme.secondary),
                          const SizedBox(height: 8),
                          Text(r['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
