interface OrdinalNumberProps {
    value: number | undefined;
}

const OrdinalNumber = ({ value }: OrdinalNumberProps) => (
    <div
        style={{
            display: "flex",
            justifyContent: "start",
            paddingLeft: '5%'
        }}
    >
        <span>{value}.</span>
    </div>
)

export default OrdinalNumber;
