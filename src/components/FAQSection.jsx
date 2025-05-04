import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';

const faqs = [
  {
    question: '1. What is ParentsChat?',
    answer: 'ParentsChat is an AI chatbot designed to provide parenting advice based on the Neufeld Model of Attachment.'
  },
  {
    question: '2. How does ParentsChat work?',
    answer: 'It uses AI to analyze your parenting questions and provides expert-backed advice on fostering secure attachment with your child.'
  },
  {
    question: '3. Is ParentsChat free to use?',
    answer: 'Yes, ParentsChat offers free access to parenting advice. Premium features may be available in the future.'
  },
  {
    question: '4. What is the Neufeld Model of Attachment?',
    answer: 'The Neufeld Model emphasizes the importance of secure attachment in child development, focusing on connection and emotional bonding between parents and children.'
  },
  {
    question: '5. Can ParentsChat replace professional parenting advice?',
    answer: 'ParentsChat offers valuable insights, but it should not replace professional consultation for serious parenting concerns.'
  },
  {
    question: "6. How can ParentsChat help me with my child's behavior?",
    answer: 'It provides guidance on handling behavioral challenges while fostering emotional security and attachment.'
  },
  {
    question: '7. Can I ask questions about teenagers?',
    answer: 'Yes! ParentsChat covers parenting advice for children of all ages, including teenagers.'
  },
  {
    question: '8. Is my data safe with ParentsChat?',
    answer: 'Yes, we take privacy seriously. Your conversations are not stored or shared.'
  },
  {
    question: '9. Can I use ParentsChat on my phone?',
    answer: 'Yes, ParentsChat is mobile-friendly and works on any device with an internet connection.'
  },
  {
    question: '10. How do I start using ParentsChat?',
    answer: 'Simply type your parenting question in the chat box and get instant advice!'
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b border-gray-200 last:border-b-0 dark:border-neutral-700`}>
      <button
        className="w-full py-6 flex justify-between items-center text-left hover:text-primary transition-colors dark:hover:text-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-neutral-800 dark:text-white">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IoIosArrowDown className="text-xl text-neutral-400 dark:text-neutral-300" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-neutral-600 pb-6 dark:text-neutral-300">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-center mb-8 dark:text-white">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm dark:bg-neutral-900 dark:shadow-none">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;