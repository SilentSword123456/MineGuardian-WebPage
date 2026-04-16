const ICON_SLOTS = 10;

function getFillSteps(remainingHalfUnits) {
    return Array.from({ length: ICON_SLOTS }, (_, index) => {
        const halves = Math.max(Math.min(remainingHalfUnits - index * 2, 2), 0);
        if (halves >= 2) return "full";
        if (halves >= 1) return "half";
        return "empty";
    });
}

function MinecraftMeter({ label, iconType, usagePercent, zeroEffectClass }) {
    const safeUsage = Math.max(0, Math.min(Math.round(usagePercent), 100));
    const remainingHalfUnits = Math.max(20 - Math.floor(safeUsage / 5), 0);
    const fills = getFillSteps(remainingHalfUnits);
    const isLow = remainingHalfUnits > 0 && remainingHalfUnits < 6;
    const isZero = remainingHalfUnits === 0;

    return (
        <div className="ss-meter-row">
            <span className="ss-block-label">{label}</span>
            <div className={`ss-meter-icons ${isLow ? "ss-meter-icons--danger" : ""} ${isZero ? zeroEffectClass : ""}`}>
                {fills.map((fill, index) => (
                    <span
                        key={`${iconType}-${index}`}
                        className={`ss-meter-icon ss-meter-icon--${iconType} ss-meter-icon--${fill}`}
                        aria-hidden="true"
                    />
                ))}
            </div>
            <span className="ss-block-pct">{safeUsage}%</span>
        </div>
    );
}

function BlockMeter({ label, pct }) {
    const lit = Math.round((pct / 100) * ICON_SLOTS);

    return (
        <div className="ss-block-row">
            <span className="ss-block-label">{label}</span>
            <div className="ss-block-bar">
                {Array.from({ length: ICON_SLOTS }).map((_, i) => {
                    const isLit = i < lit;
                    return (
                        <div
                            key={i}
                            className={`ss-block ${isLit ? "ss-block-on" : "ss-block-off"}`}
                        />
                    );
                })}
            </div>
            <span className="ss-block-pct">{Math.round(pct)}%</span>
        </div>
    );
}

function ServerStats({ cpuUsagePercent, memoryUsageMb, MAX_MEMORY_MB, minecraftMetersEnabled = true }) {
    const cpu = cpuUsagePercent ?? 0;
    const mem = memoryUsageMb ?? 0;
    const maxMem = Math.max(MAX_MEMORY_MB ?? 0, 1);
    const memPct = Math.min((mem / maxMem) * 100, 100);

    return (
        <div className="ss-card">
            <h3 className="player-avatar-section-title">Server Stats</h3>
            {minecraftMetersEnabled ? (
                <>
                    <MinecraftMeter label="CPU" iconType="hunger" usagePercent={cpu} zeroEffectClass="ss-meter-icons--starvation" />
                    <MinecraftMeter label="RAM" iconType="heart" usagePercent={memPct} zeroEffectClass="ss-meter-icons--wither" />
                </>
            ) : (
                <>
                    <BlockMeter label="CPU" pct={cpu} />
                    <BlockMeter label="RAM" pct={memPct} />
                </>
            )}
        </div>
    );
}

export default ServerStats;
