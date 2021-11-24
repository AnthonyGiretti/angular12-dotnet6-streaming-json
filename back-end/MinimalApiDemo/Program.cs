// Configure services
var builder = WebApplication.CreateBuilder(args);

// Generic CORS policy to allow everything
builder.Services.AddCors(o => o.AddPolicy("AllowAll", builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
}));

// Configure and enable middlewares
var app = builder.Build();

app.MapGet("/stream/countries", async () =>
{
    async IAsyncEnumerable<CountryModel> StreamCountriesAsync()
    {
        var countries = new List<CountryModel>(); // Your implementation here to get country list, in an ideal world the data source should be an asyncenumerable
        foreach (var country in countries)
        {
            await Task.Delay(500);
            yield return country;
        }
    }
    return StreamCountriesAsync();
});

// Run the app
app.Run();