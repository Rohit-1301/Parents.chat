import React from 'react';

const features = [
  {
    title: 'Attachment-Based Parenting',
    description: 'Understand how to build strong emotional connections with your child using the Neufeld Model.'
  },
  {
    title: 'Child Development Insights',
    description: "Get expert guidance on different stages of your child's emotional and psychological growth."
  },
  {
    title: 'Behavior & Discipline',
    description: 'Receive advice on setting healthy boundaries while maintaining a secure attachment with your child.'
  },
  {
    title: '24/7 Parenting Support',
    description: 'ParentsChat is available anytime to provide instant parenting advice and emotional support.'
  }
];

const FeatureCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {features.map((feature, index) => (
        <div key={index} className="p-6 border border-gray-100 rounded-lg shadow-card hover:shadow-md transition-shadow dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-none">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">{feature.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-300">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;