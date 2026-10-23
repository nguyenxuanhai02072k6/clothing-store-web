'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HOME_BENEFITS, BenefitItem } from './homeData';

interface HomeBenefitsSectionProps {
  benefits?: BenefitItem[];
}

export const HomeBenefitsSection: React.FC<HomeBenefitsSectionProps> = ({
  benefits = HOME_BENEFITS,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start p-7 rounded-3xl glass-card glass-card-hover"
          >
            <div className="p-3 bg-white rounded-2xl border border-brand-border mb-6 shrink-0 text-brand-text">
              {b.icon}
            </div>
            <h4 className="text-xs font-bold text-brand-text mb-2 uppercase tracking-widest">{b.title}</h4>
            <p className="text-xs text-brand-muted leading-relaxed font-normal">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
