const diameter = 50;
const strokeWidth = 7;
const radius = diameter / 2 - strokeWidth / 2;
const circ = 2 * Math.PI * radius;

export default function CircleProgress({
    color,
    progress,
    children,
}: {
    color: { h: string; s: string; l: string };
    progress: number;
    children?: React.ReactNode;
}) {
    // Math.max(progress, 0.01) makes sure it's always at least 1% complete so we get a dot on the circle
    const position = Math.max(1 - Math.max(progress, 0.01), 0);

    return (
        <div className="flex items-center justify-center">
            <svg viewBox="0 0 50 50" transform="rotate(-90)">
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={`hsla(${color.h}, ${color.s}, ${color.l}, 0.2)`}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    style={{
                        strokeDasharray: circ,
                    }}
                />
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={`hsl(${color.h}, ${color.s}, ${color.l})`}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    style={{
                        strokeDasharray: circ,
                        strokeDashoffset: circ * position,
                        strokeLinecap: "round",
                    }}
                />
            </svg>
            {children && (
                <span
                    className="absolute text-2xl font-bold"
                    style={{ color: `hsl(${color.h}, ${color.s}, ${color.l})` }}
                >
                    {children}
                </span>
            )}
        </div>
    );
}
