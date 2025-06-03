import { connectWallet } from '../web3';
import { sdk } from '../web3';
import { ModRegistryService } from '../services/ModRegistryService';
import { validateMod, injectModAssets } from '../mods/mod_loader';
import type { ModMeta as ImportedModMeta } from '../mods/mod_loader';
import { SettingsService } from '../services/SettingsService';
import { FeedbackModal, SettingsButton, ModToggleButton, WalletButton, ModCountButton, GuestModeButton, MenuButton, TitleText, Label } from '../ui/components';

// TODO: Add Guest Mode button for local play (see .primer)
// TODO: Reference artifacts and primer for onboarding and UI conventions

export class StartScene extends Phaser.Scene {
  private walletButton!: Phaser.GameObjects.Text; // Actually WalletButton returns Phaser.GameObjects.Text, but type can be improved for clarity
  private modRegistryService?: ModRegistryService;
  private enabledMods: Set<string> = new Set();
  private loadedModScripts: Map<string, HTMLScriptElement> = new Map();
  private feedbackModal?: FeedbackModal;

  constructor() {
    super({ key: 'StartScene' });
  }

  async create() {
    // --- Upgrade: Responsive Layout ---
    const centerX = this.cameras.main.width / 2;
    const baseY = 150;
    // Title (modular)
    new TitleText({
      scene: this,
      x: centerX,
      y: baseY,
      text: 'protoFusionGirl',
      style: { fontSize: '40px', color: '#fff' }
    }).create();
    // Start button (modular)
    new MenuButton({
      scene: this,
      x: centerX,
      y: baseY + 100,
      label: 'Start Game',
      style: { fontSize: '28px', color: '#0ff' },
      onClick: () => this.scene.start('GameScene')
    }).create();
    // Web3 wallet connect button (modular)
    // [Artifact: task_add_a_web3_wallet_connect_button_to_the_start_screen_see_primer_startscene_ts_9_20250603.artifact]
    // See .primer for onboarding and UI conventions
    const walletBtn = new WalletButton({
      scene: this,
      x: centerX,
      y: baseY + 200,
      onConnect: async () => {
        const address = await connectWallet();
        if (!address) {
          new Label({
            scene: this,
            x: centerX,
            y: baseY + 250,
            text: 'Guest Mode: Limited features',
            style: { fontSize: '20px', color: '#aaa' }
          }).create();
          new Label({
            scene: this,
            x: centerX,
            y: baseY + 280,
            text: 'Please install MetaMask for Web3',
            style: { fontSize: '16px', color: '#f00' }
          }).create();
        }
        return address;
      }
    }).create();
    this.walletButton = walletBtn;
    // Guest mode button (modular)
    new GuestModeButton({
      scene: this,
      x: centerX,
      y: baseY + 240,
      onGuest: () => {
        this.walletButton.setText('Guest Mode');
        new Label({
          scene: this,
          x: centerX,
          y: baseY + 280,
          text: 'Guest Mode: Limited features',
          style: { fontSize: '16px', color: '#aaa' }
        }).create();
      }
    }).create();
    // Mod count button (modular)
    new ModCountButton({
      scene: this,
      x: centerX,
      y: baseY + 320,
      onFetch: async () => {
        if (!this.modRegistryService) {
          this.modRegistryService = new ModRegistryService(sdk);
        }
        return await this.modRegistryService.getModCount();
      }
    }).create();

    // --- Dynamic Mod Management UI ---
    const modFiles = import.meta.glob<ImportedModMeta>('../mods/*.json', { eager: true });
    const mods: ImportedModMeta[] = Object.values(modFiles)
      .map((mod: any) => (mod.default ? mod.default : mod))
      .filter(validateMod);
    let modY = baseY + 370;
    new Label({
      scene: this,
      x: centerX,
      y: modY,
      text: 'Available Mods:',
      style: { fontSize: '22px', color: '#fff' }
    }).create();
    modY += 30;
    mods.forEach((mod: ImportedModMeta) => {
      const enabled = this.enabledMods.has(mod.name);
      new Label({
        scene: this,
        x: centerX - 180,
        y: modY,
        text: `${mod.name} v${mod.version}\n${mod.description || ''}`,
        style: { fontSize: '18px', color: enabled ? '#0fa' : '#0af', wordWrap: { width: 300 } },
        originX: 0,
        originY: 0.5
      }).create();
      new ModToggleButton({
        scene: this,
        x: centerX + 180,
        y: modY,
        enabled,
        onToggle: (isEnabled: boolean) => {
          if (isEnabled) {
            this.enabledMods.add(mod.name);
            injectModAssets(mod, this);
            if (mod.entry) {
              const scriptUrl = mod.entry.startsWith('http') ? mod.entry : `/src/mods/${mod.entry}`;
              const script = document.createElement('script');
              script.src = scriptUrl;
              script.async = true;
              script.onload = () => console.log(`[Mod] Script loaded: ${mod.entry}`);
              script.onerror = () => console.error(`[Mod] Failed to load script: ${mod.entry}`);
              document.body.appendChild(script);
              this.loadedModScripts.set(mod.name, script);
            }
            console.log(`[Mod] Enabled: ${mod.name}`);
          } else {
            this.enabledMods.delete(mod.name);
            if (this.loadedModScripts.has(mod.name)) {
              const script = this.loadedModScripts.get(mod.name);
              if (script && script.parentNode) script.parentNode.removeChild(script);
              this.loadedModScripts.delete(mod.name);
            }
            // TODO: Optionally unload mod assets here
            console.log(`[Mod] Disabled: ${mod.name}`);
          }
        }
      }).create();
      modY += 40;
    });
    if (mods.length === 0) {
      modY += 10;
      new Label({
        scene: this,
        x: centerX,
        y: modY,
        text: 'No mods found. Add .json files to src/mods!',
        style: { fontSize: '18px', color: '#faa', backgroundColor: '#222', padding: { left: 8, right: 8, top: 4, bottom: 4 } }
      }).create();
    }

    // --- Feedback Button (Community Engagement) ---
    new MenuButton({
      scene: this,
      x: centerX - 340,
      y: this.cameras.main.height - 40,
      label: 'Feedback',
      style: { fontSize: '18px', color: '#fff', backgroundColor: '#0af', padding: { left: 12, right: 12, top: 6, bottom: 6 } },
      onClick: () => {
        if (!this.feedbackModal) {
          this.feedbackModal = new FeedbackModal(this, centerX, (value: string) => {
            console.log('[Feedback] Submitted:', value);
          });
        }
        this.feedbackModal.show();
      }
    }).create();
    new SettingsButton(this, centerX + 340, this.cameras.main.height - 40).create();

    // Apply settings (future: use for audio, debug, etc.)
    const settings = SettingsService.getInstance();
    if (settings.get('showDebug')) {
      // Example: show debug overlay or enable debug features
      console.log('[Settings] Debug mode enabled');
    }
    // Example: listen for settings changes (future-proof)
    settings.onChange((newSettings) => {
      // React to settings changes globally
      if (newSettings.language) {
        // Future: update UI language
      }
      if (typeof newSettings.showDebug === 'boolean') {
        // Future: toggle debug overlays
      }
    });
  }
}