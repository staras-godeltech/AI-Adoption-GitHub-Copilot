import React from 'react';

const services = [
  { name: 'Haircut & Style', duration: '60 min', price: '$45', description: 'Professional cut and styling tailored to your preferences.' },
  { name: 'Hair Coloring', duration: '120 min', price: '$85', description: 'Full color, highlights, or balayage with premium products.' },
  { name: 'Manicure', duration: '45 min', price: '$30', description: 'Classic manicure with polish of your choice.' },
  { name: 'Pedicure', duration: '60 min', price: '$40', description: 'Relaxing pedicure with exfoliation and polish.' },
  { name: 'Facial Treatment', duration: '90 min', price: '$65', description: 'Deep cleansing facial customized for your skin type.' },
  { name: 'Eyebrow Shaping', duration: '30 min', price: '$20', description: 'Precise shaping and tinting for perfectly defined brows.' },
];

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Services</h1>
        <p className="text-gray-600 mb-8">Choose from our range of professional beauty services.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.name} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">{service.duration}</span>
                <span className="text-indigo-600 font-bold text-lg">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
