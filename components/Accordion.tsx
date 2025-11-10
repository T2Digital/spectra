import React, { useState } from 'react';
import { ChevronDown } from './icons';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold">{title}</h3>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 text-right">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accordion;
