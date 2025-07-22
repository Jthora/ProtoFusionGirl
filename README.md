# ProtoFusionGirl

A Phaser.js-based game with Web3 integration, featuring dynamic difficulty scaling and blockchain-powered modding capabilities.

## Features

- **Dynamic Difficulty System**: 7 difficulty levels from Sandbox to Impossible
- **Web3 Integration**: Blockchain-powered mod registry and governance
- **Phaser.js Game Engine**: Modern 2D game development
- **TypeScript**: Full type safety and modern development experience
- **Vite Build System**: Fast development and optimized production builds

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## Deployment

### Quick Deployment to Vercel

**Option 1: Manual Build + Deploy**
```bash
# Build the project locally
npm run build:vercel

# Deploy to production (from project root)
vercel --prod
```

**Option 2: Direct Command**
```bash
# Single command deployment
npm run deploy
```

**Option 3: Deploy specific build**
```bash
# Deploy just the dist folder
cd dist && vercel --prod
```

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `docs/` - Documentation
- `contracts/` - Smart contracts (Hardhat)
- `test/` - Test files
- `artifacts/` - Build artifacts and documentation

## Environment Variables

Create a `.env` file in the root directory:

```env
# Web3 Configuration
VITE_MOD_REGISTRY_ADDRESS=your_contract_address_here
VITE_NETWORK_RPC_URL=your_rpc_url_here

# Development
NODE_ENV=development
```

## Security & Dependencies

### ✅ Zero Vulnerabilities
This project maintains **0 vulnerabilities** through:
- Curated dependency selection
- Regular security audits with `npm audit`
- Minimal dependency footprint
- Use of well-maintained, secure packages

### Dependency Management
```bash
# Check for vulnerabilities
npm audit

# Install dependencies (clean, no conflicts)
npm install

# Dependencies are tested to install without --legacy-peer-deps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is private and proprietary.
