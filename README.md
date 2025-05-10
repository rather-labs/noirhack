# On-chain quests Hub

This is the repository for Rather Labs' innovation team Noir hackaton project.

Our project is built on the concept of creating missions on the wonderful global computer, and thanks to technologies like Noir and ZK, these can be completed by one or multiple people around the world without ever revealing the solution, all for a potential reward (of any kind).

The potential is infinite. We chose to create a proof of concept by building an on-chain verifiable riddle hub. The premise is simple: someone creates a "quest-riddle," and anyone can try to solve it by submitting their answer; the first person to crack it wins the prize. Again, we believe the possibilities are boundless. Had we had more time and deeper expertise with the technology, these are the use cases we would have loved to develop:

* IRL treasure hunts with anonymous on-chain validation
* Competitive programming competitions
* DAO voting for decision-making
* Airdrop mission checklists
* Science problem-solving contests
* Distribution of event tickets (e.g., like the rAave riddles)
* Educational micro-credentials (e.g., badges that prove you've mastered differential equations)
* Bug-bounty puzzles
* Off-chain data utilization and validation

…and much more. All you need is a whiteboard, a pair of sharp minds, and creativity. on-chain quests don't just have the potential to scale infinitely, they're also a lot of fun.

Lastly, we'd love to hear your feedback and ideas for new quests we could create. Thank you, this hackathon was an amazing opportunity to work with cutting-edge technology while having fun and learning so much! <3

# Deployment

## Local hardhat node
To try out the app you have to first start a local hardhat node

```bash
cd contract
```

```bash
npm run start
```
And deploy the Verifier and QuestFactory contracts. 
This will also create 5 initial riddle quests for you to answer :).
```bash
npm run deploy
```

## Run the client with the quest hub
```bash
cd frontend
```

```bash
npm run dev
```

## Have fun!
