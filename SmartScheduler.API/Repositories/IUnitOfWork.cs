using SmartScheduler.API.Models;

namespace SmartScheduler.API.Repositories;

public interface IUnitOfWork : IDisposable
{
    IRepository<Course> Courses { get; }
    IRepository<Instructor> Instructors { get; }
    IRepository<Classroom> Classrooms { get; }
    Task<int> SaveChangesAsync();
}
