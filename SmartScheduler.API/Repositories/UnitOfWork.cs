using SmartScheduler.API.Data;
using SmartScheduler.API.Models;

namespace SmartScheduler.API.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IRepository<Course> Courses { get; }
    public IRepository<Instructor> Instructors { get; }
    public IRepository<Classroom> Classrooms { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Courses = new Repository<Course>(context);
        Instructors = new Repository<Instructor>(context);
        Classrooms = new Repository<Classroom>(context);
    }

    public async Task<int> SaveChangesAsync() =>
        await _context.SaveChangesAsync();

    public void Dispose() =>
        _context.Dispose();
}
