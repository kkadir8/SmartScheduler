namespace SmartScheduler.API.Models.Algorithm;

/// <summary>
/// Genetik algoritma kromozomu — eksiksiz bir haftalık ders programını temsil eder.
/// </summary>
public class Chromosome
{
    public List<Gene> Genes { get; set; } = new();
    public double Fitness { get; set; }

    public Chromosome() { }

    public Chromosome(List<Gene> genes)
    {
        Genes = genes;
    }

    public Chromosome Clone()
    {
        return new Chromosome(Genes.Select(g => g.Clone()).ToList())
        {
            Fitness = Fitness
        };
    }
}
