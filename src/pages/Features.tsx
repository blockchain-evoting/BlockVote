import React from 'react';

const Features: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">E-Voting System Features</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Secure Blockchain Voting"
          description="Votes are securely recorded on Hyperledger Fabric blockchain, ensuring immutability and transparency."
          icon="🔒"
        />
        <FeatureCard
          title="Two-Factor Authentication"
          description="Enhanced security with 2FA to ensure only authorized voters can access the system."
          icon="🔐"
        />
        <FeatureCard
          title="Real-time Results"
          description="View election results in real-time as votes are being counted."
          icon="📊"
        />
        <FeatureCard
          title="Voter Verification"
          description="Multi-step verification process to validate voter identity and eligibility."
          icon="✅"
        />
        <FeatureCard
          title="Admin Dashboard"
          description="Comprehensive dashboard for election administrators to manage the voting process."
          icon="⚙️"
        />
        <FeatureCard
          title="Transparent Auditing"
          description="Full audit trail of all voting transactions stored on the blockchain."
          icon="📝"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Features;
