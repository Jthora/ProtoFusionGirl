#!/bin/bash
# Copies FusionGirl_Sounds/2ndPass → public/audio/ with clean filenames.
# Naming: tone_0_p1_v1 through v4 (p = prompt group, v = variant within that prompt batch).
# The CombinatorialPool picks one random v from each p and layers them simultaneously.

set -e
BASE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$BASE/FusionGirl_Sounds/2ndPass"
DEST="$BASE/public/audio"

ok() { echo "  ✓ $1"; }
missing() { echo "  ✗ MISSING: $1  [prefix: $2]"; }

# cp_group <src-dir> <file-prefix> <dest-dir> <dest-stem>
# Copies all 4 variants (#1 through #4) for a given prompt prefix.
# Output: <dest-stem>_v1.mp3 through <dest-stem>_v4.mp3
cp_group() {
  local dir="$1" prefix="$2" destdir="$3" stem="$4"
  for v in 1 2 3 4; do
    local file=""
    while IFS= read -r f; do
      [ -z "$file" ] && file="$f"
    done < <(find "$dir" -maxdepth 1 -name "${prefix}#${v}-*.mp3" 2>/dev/null | sort)
    if [ -n "$file" ]; then
      cp "$file" "$destdir/${stem}_v${v}.mp3"
      ok "${stem}_v${v}.mp3"
    else
      missing "${stem}_v${v}.mp3" "${prefix}#${v}-"
    fi
  done
}

# cp_group_nth — when same prefix appears in multiple batches (two runs of same prompt)
# picks the nth batch chronologically (sorted by filename/timestamp)
cp_group_nth() {
  local dir="$1" prefix="$2" nth="$3" destdir="$4" stem="$5"
  for v in 1 2 3 4; do
    local file="" count=0
    while IFS= read -r f; do
      count=$((count + 1))
      [ "$count" -eq "$nth" ] && file="$f"
    done < <(find "$dir" -maxdepth 1 -name "${prefix}#${v}-*.mp3" 2>/dev/null | sort)
    if [ -n "$file" ]; then
      cp "$file" "$destdir/${stem}_v${v}.mp3"
      ok "${stem}_v${v}.mp3"
    else
      missing "${stem}_v${v}.mp3 (batch ${nth})" "${prefix}#${v}-"
    fi
  done
}

echo ""
echo "=== Harmonic Tones (12 tones × 3 prompt groups × 4 variants = 144 files) ==="
D="$DEST/harmonic"

T0="$SRC/tone_0 — Stillness : Root (Unison)"
cp_group "$T0" "Tibetan_crystal_sing_"   "$D" "tone_0_p1"
cp_group "$T0" "Glass_tuning_fork_st_"   "$D" "tone_0_p2"
cp_group "$T0" "Large_crystal_resona_"   "$D" "tone_0_p3"

T1="$SRC/tone_1 — Tension : Dissonance (near-unison beating)"
cp_group "$T1" "Two_crystal_wine_gla_"   "$D" "tone_1_p1"
cp_group "$T1" "Two_glass_tuning_for_"   "$D" "tone_1_p2"
cp_group "$T1" "Metal_rod_struck_aga_"   "$D" "tone_1_p3"

T2="$SRC/tone_2 — Curiosity : Movement (bright ascending step)"
cp_group "$T2" "Two_small_crystal_be_"   "$D" "tone_2_p1"
cp_group "$T2" "Marimba_bar_pair_str_"   "$D" "tone_2_p2"
cp_group "$T2" "Two_glass_xylophone__"   "$D" "tone_2_p3"

T3="$SRC/tone_3 — Melancholy : Empathy (soft, warm, sorrowful)"
cp_group "$T3" "Crystal_singing_bowl_"   "$D" "tone_3_p1"
cp_group "$T3" "Two_small_brass_bell_"   "$D" "tone_3_p2"
cp_group "$T3" "Glass_harmonica_disc_"   "$D" "tone_3_p3"

T4="$SRC/tone_4 — Hope : Warmth (bright, consonant, uplifting)"
cp_group "$T4" "Crystal_bell_struck__"   "$D" "tone_4_p1"
cp_group "$T4" "Two_crystal_singing__"   "$D" "tone_4_p2"
cp_group "$T4" "Small_hand_bell_rung_"   "$D" "tone_4_p3"

T5="$SRC/tone_5 — Balance : Structure (grounded, stable, symmetric)"
cp_group "$T5" "Two_crystal_bowls_st_"   "$D" "tone_5_p1"
cp_group "$T5" "Vibraphone_bar_struc_"   "$D" "tone_5_p2"
cp_group "$T5" "Two_tuning_forks_of__"   "$D" "tone_5_p3"

T6="$SRC/tone_6 — Chaos : Transformation (maximally dissonant, clashing)"
cp_group_nth "$T6" "Two_metal_rods_struc_" 1 "$D" "tone_6_p1"
cp_group "$T6" "Two_crystal_glasses__"   "$D" "tone_6_p2"
cp_group "$T6" "Glass_plate_resonanc_"   "$D" "tone_6_p3"

T7="$SRC/tone_7 — Power : Clarity (strong, resonant, authoritative)"
cp_group "$T7" "Two_large_crystal_si_"   "$D" "tone_7_p1"
cp_group "$T7" "Large_temple_bell_st_"   "$D" "tone_7_p2"
cp_group "$T7" "Two_vibraphone_bars__"   "$D" "tone_7_p3"

T8="$SRC/tone_8 — Mystery : Wonder (ambiguous, shimmering, otherworldly)"
cp_group "$T8" "Crystal_wine_glass_r_"   "$D" "tone_8_p1"
cp_group "$T8" "Glass_armonica_disc__"   "$D" "tone_8_p2"
cp_group "$T8" "Two_crystal_bells_st_"   "$D" "tone_8_p3"

T9="$SRC/tone_9 — Connection : Belonging (warm, resolved, arriving)"
cp_group_nth "$T9" "Two_crystal_singing__" 1 "$D" "tone_9_p1"
cp_group "$T9" "Small_hand_bell_and__"   "$D" "tone_9_p2"
cp_group "$T9" "Two_glass_tuning_for_"   "$D" "tone_9_p3"

T10="$SRC/tone_10 — Longing : Unresolved (reaching but not arriving)"
cp_group "$T10" "Two_crystal_bells_st_"  "$D" "tone_10_p1"
cp_group "$T10" "Glass_harmonica_prod_"  "$D" "tone_10_p2"
cp_group "$T10" "Bowed_metal_bar_prod_"  "$D" "tone_10_p3"

T11="$SRC/tone_11 — Anticipation : Threshold (one step from resolution)"
cp_group_nth "$T11" "Two_crystal_bowls_st_" 1 "$D" "tone_11_p1"
cp_group "$T11" "Small_crystal_bell_s_"  "$D" "tone_11_p2"
cp_group "$T11" "Glass_xylophone_bar__"  "$D" "tone_11_p3"

echo ""
echo "=== Beu Lifecycle Stingers (5 stages × 2 prompts × 4 variants) ==="
D="$DEST/beu"
BEU="$SRC/beu_lifecycle"

cp_group_nth "$BEU/seed_stinger"   "One_tiny_crystal_bel_" 1 "$D" "beu_seed_p1"
cp_group_nth "$BEU/seed_stinger"   "One_tiny_crystal_bel_" 2 "$D" "beu_seed_p2"
cp_group "$BEU/sprout_stinger" "Three_small_crystal__"       "$D" "beu_sprout_p1"
cp_group "$BEU/sprout_stinger" "Quick_ascending_thre_"       "$D" "beu_sprout_p2"
cp_group "$BEU/growth_stinger" "Five_crystal_bells_s_"       "$D" "beu_growth_p1"
cp_group "$BEU/growth_stinger" "Quick_ascending_five_"       "$D" "beu_growth_p2"
cp_group "$BEU/bloom_stinger"  "Multiple_crystal_bow_"       "$D" "beu_bloom_p1"
cp_group "$BEU/bloom_stinger"  "Full_chord_of_six_cr_"       "$D" "beu_bloom_p2"
cp_group "$BEU/bond_stinger"   "Two_separate_crystal_"       "$D" "beu_bond_p1"
cp_group "$BEU/bond_stinger"   "Two_glass_bells_stru_"       "$D" "beu_bond_p2"

echo ""
echo "=== UL Casting ==="
D="$DEST/ul"
cp_group "$SRC/cast_init"    "One_small_crystal_be_"   "$D" "ul_init_p1"
cp_group "$SRC/cast_init"    "Single_sharp_crystal_"   "$D" "ul_init_p2"
cp_group "$SRC/cast_charge"  "Continuous_high-freq_"   "$D" "ul_charge_p1"
cp_group "$SRC/cast_charge"  "Steady_electric_sine_"   "$D" "ul_charge_p2"
cp_group "$SRC/cast_release" "Crystal_singing_bowl_"   "$D" "ul_release_p1"
cp_group "$SRC/cast_release" "Multiple_crystal_bel_"   "$D" "ul_release_p2"
cp_group "$SRC/cast_release" "Large_crystal_bowl_s_"   "$D" "ul_release_p3"
cp_group "$SRC/cast_fail"    "Crystal_bowl_struck__"   "$D" "ul_fail_p1"
cp_group "$SRC/cast_fail"    "Two_glass_tones_stru_"   "$D" "ul_fail_p2"

echo ""
echo "=== Node Events ==="
D="$DEST/nodes"
cp_group "$SRC/distress" "Two-tone_glass_chime_"        "$D" "node_distress_p1"
cp_group "$SRC/distress" "Crystal_bell_struck,_"        "$D" "node_distress_p2"
cp_group_nth "$SRC/distress" "A_sustained_crystal__" 1  "$D" "node_distress_p3"
cp_group "$SRC/collapse" "A_sustained_crystal__"        "$D" "node_collapse_p1"
cp_group_nth "$SRC/collapse" "Multiple_crystal_and_" 1  "$D" "node_collapse_p2"
cp_group "$SRC/collapse" "Crystal_bowl_resonan_"        "$D" "node_collapse_p3"
cp_group "$SRC/restore"  "Two_crystal_bells_st_"        "$D" "node_restore_p1"
cp_group "$SRC/restore"  "Crystal_singing_bowl_"        "$D" "node_restore_p2"

echo ""
echo "=== Trust Milestones ==="
D="$DEST/trust"
TM="$SRC/trust_milestones"
cp_group "$TM/milestone_25"  "Two_small_crystal_be_"    "$D" "trust_25_p1"
cp_group "$TM/milestone_25"  "Three_glass_bells_in_"    "$D" "trust_25_p2"
cp_group "$TM/milestone_50"  "Four_crystal_bells_i_"    "$D" "trust_50_p1"
cp_group "$TM/milestone_50"  "Two_crystal_singing__"    "$D" "trust_50_p2"
cp_group "$TM/milestone_75"  "Six_crystal_bells_st_"    "$D" "trust_75_p1"
cp_group "$TM/milestone_75"  "Multiple_crystal_bow_"    "$D" "trust_75_p2"
cp_group "$TM/milestone_100" "Two_crystal_tones_st_"    "$D" "trust_100_p1"
cp_group "$TM/milestone_100" "A_dense_chord_of_cry_"    "$D" "trust_100_p2"
cp_group "$TM/milestone_100" "All_pitches_of_a_cry_"    "$D" "trust_100_p3"

echo ""
echo "=== Rift ==="
D="$DEST/rift"
cp_group "$SRC/rift_warning" "Single_sharp_high-fr_"    "$D" "rift_warning_p1"
cp_group "$SRC/rift_warning" "Crystal_bell_struck__"    "$D" "rift_warning_p2"
cp_group "$SRC/rift_warning" "Warped_electronic_to_"    "$D" "rift_warning_p3"
cp_group "$SRC/rift_warning" "Two_sharp_dissonant__"    "$D" "rift_warning_p4"
cp_group_nth "$SRC/rift_seal" "Dissonant_electronic_" 1 "$D" "rift_seal_p1"
cp_group_nth "$SRC/rift_seal" "Distorted_oscillatin_" 1 "$D" "rift_seal_p2"
cp_group "$SRC/rift_seal"    "Single_large_crystal_"    "$D" "rift_seal_p3"

echo ""
echo "=== Jane ==="
D="$DEST/jane"
cp_group "$SRC/hurt"   "Close-mic'd_body_imp_"          "$D" "jane_hurt_p1"
cp_group "$SRC/hurt"   "Short_sharp_impact_t_"          "$D" "jane_hurt_p2"
cp_group "$SRC/hurt"   "Heavier_dull_body_im_"          "$D" "jane_hurt_p3"
cp_group "$SRC/attack" "Quick_short_whoosh_o_"          "$D" "jane_attack_p1"
cp_group "$SRC/attack" "Fast_air_movement_an_"          "$D" "jane_attack_p2"
cp_group "$SRC/attack" "Crisp_snap_of_physic_"          "$D" "jane_attack_p3"

echo ""
echo "=== Speeder ==="
D="$DEST/speeder"
cp_group "$SRC/boost"  "Sudden_electromagnet_"          "$D" "speeder_boost_p1"
cp_group "$SRC/boost"  "Electronic_whoosh_wi_"          "$D" "speeder_boost_p2"

echo ""
echo "=== Ley Lines ==="
D="$DEST/leylines"
cp_group_nth "$SRC/leyline_activate" "Low-frequency_geolog_" 1 "$D" "leyline_activate_p1"
cp_group "$SRC/leyline_activate"     "Deep_earth_bass_reso_"   "$D" "leyline_activate_p2"

echo ""
echo "=== PsiNet ==="
D="$DEST/psinet"
cp_group "$SRC/psinet_connect" "Clean_digital_confir_"   "$D" "psinet_connect_p1"
cp_group "$SRC/psinet_connect" "Short_ascending_elec_"   "$D" "psinet_connect_p2"
cp_group "$SRC/psinet_alert"   "Rapid_two-pulse_elec_"   "$D" "psinet_alert_p1"
cp_group "$SRC/psinet_alert"   "Single_sharp_electro_"   "$D" "psinet_alert_p2"

echo ""
echo "=== Done ==="
echo "All variants copied. CombinatorialPool can now layer across prompt groups."
