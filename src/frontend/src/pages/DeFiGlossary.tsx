import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const glossaryTerms = [
  { term: "AMM", definition: "Automated Market Maker – A decentralized exchange protocol that uses mathematical formulas to price assets instead of order books." },
  { term: "APY", definition: "Annual Percentage Yield – The real rate of return on an investment, accounting for compounding interest." },
  { term: "DEX", definition: "Decentralized Exchange – A peer-to-peer marketplace where transactions occur directly between crypto traders." },
  { term: "DeFi", definition: "Decentralized Finance – Financial services built on blockchain technology without traditional intermediaries." },
  { term: "Gas", definition: "The fee required to execute transactions on a blockchain network." },
  { term: "Impermanent Loss", definition: "The temporary loss of funds experienced by liquidity providers due to price changes of deposited assets." },
  { term: "Liquidity Pool", definition: "A collection of funds locked in a smart contract, used to facilitate decentralized trading and lending." },
  { term: "NFT", definition: "Non-Fungible Token – A unique digital asset that represents ownership of a specific item on the blockchain." },
  { term: "Slippage", definition: "The difference between the expected price of a trade and the actual price at which it executes." },
  { term: "Smart Contract", definition: "Self-executing code stored on a blockchain that automatically enforces the terms of an agreement." },
  { term: "Staking", definition: "Locking up cryptocurrency to support network operations and earn rewards." },
  { term: "TVL", definition: "Total Value Locked – The total amount of assets deposited in a DeFi protocol." },
  { term: "Wallet", definition: "A digital tool that stores your private keys and allows you to interact with blockchain networks." },
  { term: "Yield Farming", definition: "The practice of moving crypto assets between DeFi protocols to maximize returns." },
];

const DeFiGlossary = () => {
  const [search, setSearch] = useState("");

  const filtered = glossaryTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">DeFi Glossary</h1>
        <p className="text-muted-foreground">Key terms and definitions in decentralized finance</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-primary">{item.term}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.definition}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No terms found matching "{search}"</p>
        )}
      </div>
    </div>
  );
};

export default DeFiGlossary;
