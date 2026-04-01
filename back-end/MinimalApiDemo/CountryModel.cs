namespace MinimalApiDemo;

public record class CountryModel
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string FlagUri { get; init; } = string.Empty;
    public string CapitalCity { get; init; } = string.Empty;
    public string Anthem { get; init; } = string.Empty;
    public IEnumerable<string> Languages { get; init; } = [];
}