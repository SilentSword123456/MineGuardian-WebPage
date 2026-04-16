import { MG_EMERALD, MG_AMBER, MG_CRIMSON } from '@/lib/colors';

const blocks = 10;

function ServerStats({ cpuUsagePercent, memoryUsageMb, MAX_MEMORY_MB }) {
    const cpu = cpuUsagePercent ?? 0;
    const mem = memoryUsageMb ?? 0;
    const maxMem = Math.max(MAX_MEMORY_MB ?? 0, 1);
    const memPct = Math.min((mem / maxMem) * 100, 100);

    const getUsageColor = (pct) => {
        if (pct < 50) return MG_EMERALD;
        if (pct < 80) return MG_AMBER;
        return MG_CRIMSON;
    };

    function displayBlockBar(label, pct) {
        const lit = Math.round((pct / 100) * blocks);
        const color = getUsageColor(pct);
        
        return (
            <div className="ss-block-row">
                <span className="ss-block-label">{label}</span>
                <div className="ss-block-bar">
                    {Array.from({ length: blocks }).map((_, i) => {
                        const isLit = i < lit;
                        return (
                            <div
                                key={i}
                                className={`ss-block ${isLit ? "ss-block-on" : "ss-block-off"}`}
                                style={isLit ? { backgroundColor: color, boxShadow: `0 0 6px ${color}` } : {}}
                            />
                        );
                    })}
                </div>
                <span className="ss-block-pct">{Math.round(pct)}%</span>
            </div>
        );
    }

    return (
        <div className="ss-card">
            <h3 className="player-avatar-section-title">Server Stats</h3>
            {displayBlockBar("CPU", cpu)}
            {displayBlockBar("RAM", memPct)}
        </div>
    );
}

export default ServerStats;
