# Security Policy for ProtoFusionGirl

## Security Standards

This project maintains **zero known vulnerabilities** through:

### Dependency Management
- All dependencies are kept up-to-date with latest secure versions
- Regular security audits using `npm audit`
- Automated dependency updates via Dependabot
- No deprecated packages in production builds

### Current Security Status
- ✅ **0 Known Vulnerabilities** (as of latest audit)
- ✅ **Latest LTS Node.js** (v20.18.0)
- ✅ **Updated Dependencies** (all packages at latest secure versions)

### Security Checks

Run these commands to verify security status:

```bash
# Check for vulnerabilities
npm audit

# Fix any fixable issues
npm audit fix

# Check for outdated packages
npm outdated

# Update all dependencies
npm update
```

### Reporting Security Issues

If you discover a security vulnerability, please report it via:

1. **GitHub Security Advisories**: Use the "Security" tab in the repository
2. **Email**: Contact the maintainers directly for sensitive issues

### Automated Security

- **Dependabot**: Automatically creates PRs for security updates
- **GitHub Security Scanning**: Continuous monitoring for new vulnerabilities
- **CI/CD Security Checks**: All builds include security audits

## Dependency Security Status

### Core Dependencies
- `phaser`: ^3.90.0 ✅ (Latest stable)
- `axios`: ^1.9.0 ✅ (Latest secure)
- `zod`: ^4.0.5 ✅ (Latest with breaking changes handled)

### Development Dependencies
- `vite`: ^7.0.5 ✅ (Latest with performance improvements)
- `jest`: ^30.0.5 ✅ (Latest with new features)
- `typescript`: ~5.8.3 ✅ (Latest stable)

Last Updated: July 22, 2025
